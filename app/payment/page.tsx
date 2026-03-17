"use client";

import { useTheme } from "@/app/providers/theme-provider";
import Link from "next/link";
import { useState } from "react";
import { Nvbar } from "../components/nvbar";

const PAYMENT_PER_PERSON = 250; // Amount in INR per person

interface PaymentFormData {
  teamName: string;
  teamLeaderName: string;
  numberOfMembers: number;
  transactionId: string;
}

export default function PaymentPage() {
  const { isLightMode } = useTheme();
  const [formData, setFormData] = useState<PaymentFormData>({
    teamName: "",
    teamLeaderName: "",
    numberOfMembers: 3, // Minimum 3 members
    transactionId: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = formData.numberOfMembers * PAYMENT_PER_PERSON;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File) => {
    setScreenshot(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for manual payment
    console.log("Manual payment submission:", { formData, screenshot });
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert("Payment details submitted successfully! You will receive confirmation within 24 hours.");
    setIsSubmitting(false);
  };

  return (
    <div className={`min-h-screen font-sans ${isLightMode ? "bg-[#f5f5f5]" : "bg-black"}`}>
      <Nvbar />

      <div className="container mx-auto px-4 py-8 pt-32 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-6 ${isLightMode ? "text-black" : "text-white"}`}>
            Round 2 Payment
          </h1>
          <div className={`inline-block border-[3px] px-6 py-3 font-black uppercase tracking-[0.3em] ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[6px_6px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[6px_6px_0_#fff]"}`}>
            HackX 2.0 - Shortlisted Teams Only
          </div>
          <p className={`mt-6 text-lg ${isLightMode ? "text-black/70" : "text-white/70"}`}>
            Congratulations on qualifying for Round 2! Complete payment to secure your spot.
          </p>
        </div>

        {/* Payment Amount Card */}
        <div className={`text-center mb-8 p-6 border-[3px] ${isLightMode ? "border-black bg-[#00f0ff] shadow-[8px_8px_0_#000]" : "border-white bg-[#00f0ff] shadow-[8px_8px_0_#fff]"}`}>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black mb-2">
            Registration Fee
          </h2>
          <p className="text-5xl font-black text-black">₹{totalAmount}</p>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            ₹{PAYMENT_PER_PERSON} per person × {formData.numberOfMembers} member{formData.numberOfMembers !== 1 ? 's' : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`p-8 border-[3px] mb-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}>
            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-6 ${isLightMode ? "text-black" : "text-white"}`}>
              Team Details
            </h3>

            <div className="space-y-6">
              {/* Team Name */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-widest mb-2 ${isLightMode ? "text-black" : "text-white"}`}>
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={(e) => handleInputChange("teamName", e.target.value)}
                  className={`w-full p-4 border-[3px] font-bold ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#fff]"} focus:outline-none focus:shadow-[6px_6px_0_#ff00a0]`}
                  placeholder="Enter your team name"
                />
              </div>

              {/* Team Leader Name */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-widest mb-2 ${isLightMode ? "text-black" : "text-white"}`}>
                  Team Leader Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.teamLeaderName}
                  onChange={(e) => handleInputChange("teamLeaderName", e.target.value)}
                  className={`w-full p-4 border-[3px] font-bold ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#fff]"} focus:outline-none focus:shadow-[6px_6px_0_#ff00a0]`}
                  placeholder="Enter team leader name"
                />
              </div>

              {/* Number of Members */}
              <div>
                <label className={`block text-sm font-bold uppercase tracking-widest mb-2 ${isLightMode ? "text-black" : "text-white"}`}>
                  Number of Members *
                </label>
                <select
                  required
                  value={formData.numberOfMembers}
                  onChange={(e) => handleInputChange("numberOfMembers", parseInt(e.target.value))}
                  className={`w-full p-4 border-[3px] font-bold ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#fff]"} focus:outline-none focus:shadow-[6px_6px_0_#ff00a0]`}
                >
                  <option value={3}>3 Members</option>
                  <option value={4}>4 Members</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className={`p-8 border-[3px] mb-8 ${isLightMode ? "border-black bg-white shadow-[8px_8px_0_#000]" : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"}`}>
            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-6 ${isLightMode ? "text-black" : "text-white"}`}>
              Payment Details
            </h3>

            {/* UPI Payment Instructions */}
            <div className={`p-6 border-[3px] mb-6 ${isLightMode ? "border-black bg-[#fff3cd] shadow-[4px_4px_0_#000]" : "border-white bg-[#2a2a2a] shadow-[4px_4px_0_#fff]"}`}>
              <h4 className={`text-lg font-black uppercase tracking-wide mb-4 text-black`}>
                UPI Payment Instructions
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-black mb-2">1. Pay ₹{totalAmount} to:</p>
                  <div className={`p-4 border-[3px] ${isLightMode ? "border-black bg-white" : "border-white bg-black"} font-mono text-lg font-black text-center`}>
                    <span className={isLightMode ? "text-black" : "text-white"}>hackx2024@paytm</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-black mb-2">2. Enter your UPI Transaction ID below:</p>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange("transactionId", e.target.value)}
                    className={`w-full p-4 border-[3px] font-bold ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#fff]"} focus:outline-none focus:shadow-[6px_6px_0_#ff00a0]`}
                    placeholder="Enter UPI Transaction ID"
                  />
                </div>
                <div>
                  <p className="font-bold text-black mb-2">3. Upload Payment Screenshot (Optional but recommended):</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className={`w-full p-4 border-[3px] font-bold ${isLightMode ? "border-black bg-white text-black shadow-[4px_4px_0_#000]" : "border-white bg-black text-white shadow-[4px_4px_0_#fff]"} focus:outline-none`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !formData.teamName || !formData.teamLeaderName || !formData.transactionId}
              className={`px-12 py-4 border-[3px] font-black uppercase tracking-widest transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode ? "border-black bg-[#c0ff00] text-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000]" : "border-white bg-[#c0ff00] text-black shadow-[6px_6px_0_#fff] hover:shadow-[8px_8px_0_#fff]"}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </form>

        {/* Contact Information */}
        <div className={`mt-12 p-6 border-[3px] text-center ${isLightMode ? "border-black bg-[#ff00a0] text-white shadow-[8px_8px_0_#000]" : "border-white bg-[#ff00a0] text-white shadow-[8px_8px_0_#fff]"}`}>
          <h3 className="text-lg font-black uppercase tracking-widest mb-3">Need Help?</h3>
          <p className="text-sm font-bold">
            Contact us at: <strong>hackx2024@sfit.ac.in</strong> |
            WhatsApp: <strong>+91 98765 43210</strong>
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-block px-6 py-2 border-[3px] border-white bg-black text-white font-black uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#fff]"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}