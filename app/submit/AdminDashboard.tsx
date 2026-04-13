"use client";

import { Folder, Github, ExternalLink, ChevronDown, ChevronUp, Search, Users, Clock } from "lucide-react";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

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

interface AdminDashboardProps {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  expandedProject: string | null;
  setExpandedProject: (id: string | null) => void;
  isLightMode: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AdminDashboard({
  projects,
  searchQuery,
  setSearchQuery,
  expandedProject,
  setExpandedProject,
  isLightMode,
  isLoading,
  onRefresh
}: AdminDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: projects.length },
          { label: "Active", value: projects.length }, // Placeholder for actual logic
          { label: "Teams", value: new Set(projects.map(p => p.team_name)).size },
          { label: "Images", value: projects.reduce((acc, p) => acc + (p.image_urls?.length || 0), 0) }
        ].map((stat, i) => (
          <div 
            key={i}
            className={`p-4 border-[3px] ${isLightMode ? "border-black bg-[#00f0ff]" : "border-white/30 bg-[#00f0ff]/10 text-white"}`}
          >
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
            <p className="text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex gap-4">
        <div className={`relative flex-1 border-[3px] group transition-all ${isLightMode ? "border-black bg-white focus-within:shadow-[4px_4px_0_#000]" : "border-white/30 bg-black focus-within:border-white focus-within:shadow-[4px_4px_0_#fff]"}`}>
          <div className="absolute left-4 top-[50%] translate-y-[-50%]">
            <Search className={`w-5 h-5 ${isLightMode ? "text-black/30" : "text-white/30"}`} />
          </div>
          <input
            type="text"
            placeholder="Search teams or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-sm font-bold bg-transparent outline-none placeholder:text-black/20"
          />
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`px-6 border-[3px] font-black uppercase tracking-widest text-[10px] transition-all hover:-translate-y-1 ${isLightMode ? "border-black bg-[#c0ff00] shadow-[4px_4px_0_#000]" : "border-white bg-white text-black shadow-[4px_4px_0_#fff]"}`}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "Refresh"}
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <div className={`border-[3px] border-dashed p-20 text-center ${isLightMode ? "border-black/20 text-black/30" : "border-white/10 text-white/20"}`}>
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest">No submissions found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`border-[3px] transition-all ${
                  isLightMode 
                    ? "border-black bg-white shadow-[6px_6px_0_#000]" 
                    : "border-white/30 bg-[#111] shadow-[6px_6px_0_#fff]"
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#ff00a0] px-2 py-0.5 text-[8px] font-black uppercase text-white">TEAM</span>
                        <h3 className={`text-xl font-black uppercase tracking-tight ${isLightMode ? "text-black" : "text-white"}`}>
                          {project.team_name}
                        </h3>
                      </div>
                      <p className={`text-xs font-bold ${isLightMode ? "text-black/50" : "text-white/40"}`}>
                        {project.project_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-2 border-[2px] transition-all hover:-translate-y-1 ${isLightMode ? "border-black bg-black text-white" : "border-white bg-white text-black"}`}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      {project.website_url && (
                        <a 
                          href={project.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 border-[2px] border-black bg-[#c0ff00] text-black transition-all hover:-translate-y-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className={`w-full flex items-center justify-between border-t-[3px] pt-4 text-[10px] font-black uppercase tracking-widest ${isLightMode ? "border-black/5 text-black/50" : "border-white/5 text-white/40"}`}
                  >
                    {expandedProject === project.id ? "COLLAPSE DETAILS" : "VIEW DETAILS"}
                    {expandedProject === project.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandedProject === project.id && (
                    <div className="mt-6 space-y-6">
                      <div className={`p-4 border-[2px] ${isLightMode ? "bg-black/5 border-black/5" : "bg-white/5 border-white/5"}`}>
                        <p className={`text-sm leading-relaxed ${isLightMode ? "text-black/80" : "text-white/70"}`}>
                          {project.description}
                        </p>
                      </div>

                      {project.image_urls && project.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {project.image_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt="Submission detail"
                                className={`h-24 w-full object-cover border-[2px] ${isLightMode ? "border-black" : "border-white/20"}`}
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 pt-2">
                         <div className="flex items-center gap-2">
                           <Clock className="w-3 h-3 opacity-40" />
                           <span className="text-[9px] font-bold uppercase opacity-60">
                             Last Updated: {new Date(project.updated_at).toLocaleString()}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Users className="w-3 h-3 opacity-40" />
                           <span className="text-[9px] font-bold uppercase opacity-60">
                             ID: {project.id.slice(0, 8)}...
                           </span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
