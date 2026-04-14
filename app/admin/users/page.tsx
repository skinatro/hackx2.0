"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { FullPageLoader, LoadingSpinner } from "@/app/components/ui/loading-spinner";
import { useState, useRef } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

type CsvRow = {
  name: string;
  email: string;
  phone: string;
  domain: string;
  role: string;
  team_name: string;
};

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { isLightMode } = useTheme();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
    results?: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPhone = (phone: any): string => {
    if (!phone) return "";
    const str = String(phone).trim();
    if (str.includes("E+") || str.includes("e+")) {
      try {
        // Convert scientific notation back to plain numeric string
        return Number(str).toFixed(0);
      } catch (e) {
        return str;
      }
    }
    return str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setImportResults(null);

    Papa.parse<CsvRow>(selected, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        // Validate headers roughly
        const requiredHeaders = ["name", "email", "phone", "domain", "role", "team_name"];
        const headers = results.meta.fields || [];
        const missing = requiredHeaders.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          toast.error(`Missing required columns: ${missing.join(", ")}`);
          setParsedData([]);
          return;
        }

        // Map data and fix scientific notation
        const validData = results.data
          .filter(row => row.email && row.name && row.team_name)
          .map(row => ({
            ...row,
            phone: formatPhone(row.phone)
          }));
          
        setParsedData(validData);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (!parsedData.length) {
      toast.error("No valid data to import");
      return;
    }

    setIsProcessing(true);
    setImportResults(null);

    try {
      const response = await fetch("/api/admin/import-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: parsedData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import users");
      }

      setImportResults({
        successful: data.successful || 0,
        failed: data.failed || 0,
        errors: data.errors || [],
        results: data.results || [],
      });

      if (data.failed === 0) {
        toast.success(`Successfully imported ${data.successful} users!`);
      } else {
        toast.warning(`Imported ${data.successful} users, but ${data.failed} failed.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during import");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = () => {
    if (!importResults?.results?.length) return;

    const headers = ["Name", "Email", "Password", "Status", "Team Name", "Role"];
    const rows = importResults.results.map(r => [
      r.name,
      r.email,
      r.password,
      r.status,
      r.team_name,
      r.role
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `import_report_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,phone,domain,role,team_name\nJohn Doe,john@example.com,9876543210,AI,leader,Alpha Team\nJane Smith,jane@example.com,9876543211,AI,member,Alpha Team";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "hackx_users_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 mb-12 lg:mb-0 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-4xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        <div className="text-center mb-10">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/55" : "text-white/50"}`}
          >
            Admin Panel
          </p>
          <h1
            className={`mt-3 font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`}
          >
            Import Users
          </h1>
        </div>

        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}>
              Verifying admin credentials...
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-20 border-[3px] border-dashed border-white/20">
            <p className="text-white/50 text-sm font-bold uppercase tracking-widest">
              Admin access required
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in duration-500">
          {/* Upload Section */}
          <div
            className={`flex flex-col gap-6 border-[3px] p-6 lg:p-8 ${isLightMode
              ? "border-black bg-white shadow-[8px_8px_0_#000]"
              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
              }`}
          >
            <div>
              <h2 className={`text-xl font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"}`}>
                Upload CSV
              </h2>
              <p className={`mt-2 text-xs font-bold leading-relaxed ${isLightMode ? "text-black/60" : "text-white/50"}`}>
                Upload a CSV file containing participant details. Ensure columns exactly match the template.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadTemplate}
              className={`w-fit text-[10px] font-black w-full border-[2px] p-3 uppercase tracking-widest transition-all ${isLightMode
                ? "border-black bg-slate-100 hover:bg-slate-200 text-black"
                : "border-white/30 bg-white/5 hover:bg-white/10 text-white"
                }`}
            >
              ↓ Download Template
            </button>

            <div
              className={`relative flex flex-col items-center justify-center gap-4 border-[3px] border-dashed p-8 text-center transition-all ${isLightMode
                ? "border-black/30 hover:border-black/60"
                : "border-white/20 hover:border-white/50"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isProcessing}
              />
              <div className={`text-4xl ${isLightMode ? "text-black/30" : "text-white/20"}`}>📄</div>
              <div>
                <p className={`text-sm font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"}`}>
                  {file ? file.name : "Select CSV File"}
                </p>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${isLightMode ? "text-black/50" : "text-white/40"}`}>
                  {parsedData.length > 0 ? `${parsedData.length} valid rows found` : "Click or drag file here"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={isProcessing || parsedData.length === 0}
              className={`mt-auto flex items-center justify-center gap-3 border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isLightMode
                ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]"
                : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_#c0ff00]"
                }`}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Importing...
                </>
              ) : (
                "Start Import →"
              )}
            </button>
          </div>

          {/* Results Section */}
          <div
            className={`flex flex-col gap-6 border-[3px] p-6 lg:p-8 ${isLightMode
              ? "border-black bg-white shadow-[8px_8px_0_#000]"
              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
              }`}
          >
            <div>
              <h2 className={`text-xl font-black uppercase tracking-widest ${isLightMode ? "text-black" : "text-white"}`}>
                Import Status
              </h2>
            </div>

            {importResults ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`border-[2px] p-4 text-center ${isLightMode ? "border-green-500 bg-green-50" : "border-green-500/50 bg-green-500/10"}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-green-700" : "text-green-400"}`}>
                      Successful
                    </p>
                    <p className={`mt-2 text-3xl font-black ${isLightMode ? "text-green-600" : "text-green-400"}`}>
                      {importResults.successful}
                    </p>
                  </div>
                  <div className={`border-[2px] p-4 text-center ${isLightMode ? "border-red-500 bg-red-50" : "border-red-500/50 bg-red-500/10"}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-red-700" : "text-red-400"}`}>
                      Failed
                    </p>
                    <p className={`mt-2 text-3xl font-black ${isLightMode ? "text-red-600" : "text-red-400"}`}>
                      {importResults.failed}
                    </p>
                  </div>
                </div>

                {importResults.results && importResults.results.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadReport}
                    className={`mt-4 w-full border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all ${isLightMode
                      ? "border-black bg-pink-500 text-white shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]"
                      : "border-white bg-[#ff00a0] text-white shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_#ff00a0]"
                      }`}
                  >
                    📦 Download Credentials Report
                  </button>
                )}

                {importResults.errors.length > 0 && (
                  <div className="mt-4 flex-1">
                    <p className={`mb-2 text-[10px] font-black uppercase tracking-widest ${isLightMode ? "text-red-600" : "text-red-400"}`}>
                      Error Log
                    </p>
                    <div className={`max-h-[250px] overflow-y-auto border-[2px] p-3 font-mono text-[10px] leading-relaxed ${isLightMode ? "border-black/10 bg-black/5 text-black/80" : "border-white/10 bg-white/5 text-white/80"}`}>
                      {importResults.errors.map((err, i) => (
                        <div key={i} className="mb-1 border-b border-dashed border-current pb-1 last:border-0">
                          {err}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex flex-1 items-center justify-center text-center text-sm font-bold uppercase tracking-widest ${isLightMode ? "text-black/30" : "text-white/20"}`}>
                {isProcessing ? "Processing batch..." : "Waiting for import"}
              </div>
            )}
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
