"use client";

import {
  FullPageLoader,
  LoadingSpinner,
} from "@/app/components/ui/loading-spinner";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { createClient } from "@/libs/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


import AdminDashboard from "./AdminDashboard";
import SubmitForm from "./SubmitForm";

type Project = {
  id: string;
  team_name: string;
  project_name: string;
  github_url: string;
  website_url: string;
  description: string;
  image_urls: string[];
  submitted_by: string;
  updated_at: string;
  created_at: string;
};

export default function SubmitPage() {
  const { profile, user, isAdmin, isLoading: authLoading } = useAuth();
  const { isLightMode } = useTheme();
  const supabase = useMemo(() => createClient(), []);

  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isExisting, setIsExisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [submissionsEnabled, setSubmissionsEnabled] = useState(true);

  // Admin states
  // We initialize activeTab based on isAdmin if available to avoid flicker
  const [activeTab, setActiveTab] = useState<"form" | "all">("form");

  // Synchronize tab when isAdmin changes
  useEffect(() => {
    if (isAdmin) {
      setActiveTab("all");
    }
  }, [isAdmin]);

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // Fetch submissions enabled setting with polling
  useEffect(() => {
    const fetchSubmissionsStatus = async () => {
      try {
        console.log("[SubmitPage] Fetching submissions status...");
        const { data, error } = await supabase
          .from("config")
          .select("key,value")
          .eq("key", "submissions_enabled");

        console.log("[SubmitPage] Config response:", { data, error });

        if (error) {
          console.error("[SubmitPage] Error fetching submissions status:", error);
          // Default to true if error
          setSubmissionsEnabled(true);
          return;
        }

        if (data && data.length > 0) {
          const rawValue = data[0].value;
          console.log("[SubmitPage] Raw value:", rawValue, "Type:", typeof rawValue);
          
          // Handle both "true" string and boolean true, and also "false" and false
          const isEnabled = rawValue === "true" || rawValue === true || rawValue === "True";
          console.log("[SubmitPage] Setting submissionsEnabled to:", isEnabled);
          setSubmissionsEnabled(isEnabled);
        } else {
          console.log("[SubmitPage] No config row found - defaulting to true");
          setSubmissionsEnabled(true);
        }
      } catch (err) {
        console.error("[SubmitPage] Exception:", err);
        setSubmissionsEnabled(true);
      }
    };

    // Fetch immediately
    fetchSubmissionsStatus();

    // Poll every 1.5 seconds
    const pollInterval = setInterval(fetchSubmissionsStatus, 1500);

    return () => {
      clearInterval(pollInterval);
    };
  }, [supabase]);

  // Load existing project
  useEffect(() => {
    if (!profile || isAdmin) {
      if (isAdmin) setIsLoadingProject(false);
      return;
    }
    const loadProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("team_name", profile.team_name);

      if (error) {
        console.error("Error loading project:", error);
      } else if (data && data.length > 0) {
        const p = data[0] as Project;
        setProjectName(p.project_name);
        setGithubUrl(p.github_url);
        setWebsiteUrl(p.website_url || "");
        setDescription(p.description);
        setExistingImages(p.image_urls || []);
        setIsExisting(true);
      }
      setIsLoadingProject(false);
    };
    loadProject();
  }, [profile, supabase]);

  const loadAllProjects = useCallback(async () => {
    setIsLoadingAll(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load submissions");
    } else {
      setAllProjects((data as Project[]) || []);
    }
    setIsLoadingAll(false);
  }, [supabase]);

  useEffect(() => {
    if (isAdmin && activeTab === "all") {
      loadAllProjects();
    }
  }, [isAdmin, activeTab, loadAllProjects]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if submissions are enabled (admins can always submit)
    if (!submissionsEnabled && !isAdmin) {
      toast.error("Project submissions are currently closed");
      return;
    }

    if (!projectName.trim() || !githubUrl.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!profile || !user) return;

    setIsSaving(true);

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const ext = file.name.split(".").pop();
        const fileName =
          profile.team_name +
          "-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2) +
          "." +
          ext;
        const { data, error } = await supabase.storage
          .from("project-images")
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-images").getPublicUrl(data.path);
        uploadedUrls.push(publicUrl);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const projectData = {
        team_name: profile.team_name,
        project_name: projectName.trim(),
        github_url: githubUrl.trim(),
        website_url: websiteUrl.trim() || null,
        description: description.trim(),
        image_urls: allImages,
        submitted_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (isExisting) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("team_name", profile.team_name);
        if (error) throw error;
        toast.success("Project updated successfully!");
      } else {
        const { error } = await supabase.from("projects").insert({
          ...projectData,
          created_at: new Date().toISOString(),
        });
        if (error) throw error;
        setIsExisting(true);
        toast.success("Project submitted successfully!");
      }

      setNewImages([]);
      setExistingImages(allImages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Only show full page loader during initial auth check
  if (authLoading) return <FullPageLoader />;

  // For regular users, we allow the app shell to render even if project is loading,
  // or we can keep blocking if the data is essential for the initial paint.
  // The user complained about "too much loading", so let's skip the blocking loader here
  // and handle individual loading states in the components.

  const filteredProjects = allProjects.filter(
    (p) =>
      p.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inputClass = `w-full border-[3px] px-4 py-3 text-sm font-bold outline-none transition-all focus:translate-y-[-1px] ${isLightMode
      ? "border-black bg-white text-black placeholder:text-black/30 focus:shadow-[4px_4px_0_#c0ff00]"
      : "border-white/30 bg-black text-white placeholder:text-white/30 focus:border-white/60 focus:shadow-[4px_4px_0_#c0ff00]"
    }`;

  const hackxLabelClass = `text-[10px] font-black uppercase tracking-[0.4em] ${isLightMode ? "text-black/50" : "text-white/50"}`;
  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-2 ${isLightMode ? "text-black/50" : "text-white/40"}`;
  const h1Class = `mt-3 font-black uppercase tracking-tighter text-5xl sm:text-7xl ${isLightMode ? "text-black" : "text-white"}`;
  const teamLabelClass = `mx-auto mt-4 w-fit border-[3px] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] ${isLightMode
      ? "border-black bg-[#c0ff00] text-black"
      : "border-[#c0ff00] bg-black text-[#c0ff00]"
    }`;

  const adminTabFormClass =
    activeTab === "form"
      ? isLightMode
        ? "border-black bg-[#ff00a0] text-white shadow-[4px_4px_0_#000]"
        : "border-white bg-[#ff00a0] text-white shadow-[4px_4px_0_#fff]"
      : isLightMode
        ? "border-black bg-white text-black/50"
        : "border-white/20 bg-black text-white/50";

  const adminTabAllClass =
    activeTab === "all"
      ? isLightMode
        ? "border-black bg-[#c0ff00] text-black shadow-[4px_4px_0_#000]"
        : "border-white bg-[#c0ff00] text-black shadow-[4px_4px_0_#fff]"
      : isLightMode
        ? "border-black bg-white text-black/50"
        : "border-white/20 bg-black text-white/50";

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 mb-12 lg:mb-0 ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}
    >
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-20 sm:px-6 lg:px-8 relative z-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className={hackxLabelClass}>HackX 2.0</p>
          <h1 className={h1Class}>
            {isAdmin ? "Project Gallery" : isExisting ? "Edit Project" : "Submit Project"}
          </h1>
          <div className={teamLabelClass}>
            {isAdmin ? "Admin View" : "Team: " + (profile?.team_name || "")}
          </div>
        </div>

        {/* Submissions Closed Banner */}
        {!submissionsEnabled && !isAdmin && (
          <div
            className={`mb-8 border-[3px] p-8 flex flex-col items-center gap-4 ${isLightMode
              ? "border-black bg-white shadow-[8px_8px_0_#000]"
              : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center border-[3px] bg-[#c0ff00]">
              <span className="text-3xl">⚠</span>
            </div>
            <p
              className={`text-center font-black uppercase tracking-wider text-xl ${isLightMode ? "text-black" : "text-white"}`}
            >
              Submission Locked
            </p>
            <p
              className={`text-center text-sm leading-relaxed ${isLightMode ? "text-black/80" : "text-white/80"}`}
            >
              To keep the competition fair, project submissions will only open during the <span className="font-black bg-[#c0ff00] text-black px-2">final hour</span> of the hackathon.
            </p>
            <p
              className={`text-center text-xs font-black uppercase tracking-widest ${isLightMode ? "text-black/60" : "text-white/60"}`}
            >
              Estimated opening: calculating...
            </p>
          </div>
        )}

        {/* Admin Tabs - Only show if user could theoretically submit too (not requested now) */}
        {isAdmin && false && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 border-[3px] py-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${adminTabFormClass}`}
            >
              My Submission
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 border-[3px] py-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${adminTabAllClass}`}
            >
              All Submissions ({allProjects.length})
            </button>
          </div>
        )}

        {isLoadingProject && !isAdmin ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : isAdmin && activeTab === "all" ? (
          <AdminDashboard
            projects={filteredProjects}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            expandedProject={expandedProject}
            setExpandedProject={setExpandedProject}
            isLightMode={isLightMode}
            isLoading={isLoadingAll}
            onRefresh={loadAllProjects}
          />
        ) : (
          <SubmitForm
            projectName={projectName}
            setProjectName={setProjectName}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            description={description}
            setDescription={setDescription}
            existingImages={existingImages}
            onRemoveExistingImage={removeExistingImage}
            newImages={newImages}
            onRemoveNewImage={removeNewImage}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            isExisting={isExisting}
            isLightMode={isLightMode}
            labelClass={labelClass}
            inputClass={inputClass}
            submissionsEnabled={submissionsEnabled}
            isAdmin={isAdmin}
          />
        )}
      </main>
    </div>
  );
}
