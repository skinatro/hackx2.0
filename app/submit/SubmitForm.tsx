"use client";

import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface SubmitFormProps {
  projectName: string;
  setProjectName: (val: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  existingImages: string[];
  onRemoveExistingImage: (index: number) => void;
  newImages: File[];
  onRemoveNewImage: (index: number) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  isExisting: boolean;
  isLightMode: boolean;
  labelClass: string;
  inputClass: string;
  submissionsEnabled: boolean;
  isAdmin: boolean;
}

export default function SubmitForm({
  projectName,
  setProjectName,
  githubUrl,
  setGithubUrl,
  websiteUrl,
  setWebsiteUrl,
  description,
  setDescription,
  existingImages,
  onRemoveExistingImage,
  newImages,
  onRemoveNewImage,
  onImageChange,
  onSubmit,
  isSaving,
  isExisting,
  isLightMode,
  labelClass,
  inputClass,
  submissionsEnabled,
  isAdmin
}: SubmitFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`border-[3px] p-8 ${isLightMode
        ? "border-black bg-white shadow-[8px_8px_0_#000]"
        : "border-white/30 bg-[#111] shadow-[8px_8px_0_#fff]"
        }`}
    >
      <div className="flex flex-col gap-6">
        {/* Project Name */}
        <div>
          <label htmlFor="project-name" className={labelClass}>
            Project Name *
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. SmartBharat Analytics"
            className={inputClass}
            required
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="github-url" className={labelClass}>
            GitHub URL *
          </label>
          <input
            id="github-url"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="github.com/yourteam/project"
            className={inputClass}
            required
          />
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="website-url" className={labelClass}>
            Website URL (optional)
          </label>
          <input
            id="website-url"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="yourproject.com"
            className={inputClass}
          ></input>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Project Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project, its impact, the technology used, and how it addresses the problem statement..."
            rows={6}
            className={`${inputClass} resize-y`}
            required
          />
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>
            Project Images
          </label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={"Project image " + (i + 1)}
                    className={`h-20 w-20 object-cover border-[3px] ${isLightMode ? "border-black" : "border-white/30"}`}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(i)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center border-[2px] border-black bg-[#ff00a0] text-white text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New image previews */}
          {newImages.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {newImages.map((file, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={"New image " + (i + 1)}
                    className={`h-20 w-20 object-cover border-[3px] border-dashed ${isLightMode ? "border-black/50" : "border-white/20"}`}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveNewImage(i)}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center border-[2px] border-black bg-[#ff00a0] text-white text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            htmlFor="image-upload"
            className={`cursor-pointer flex items-center justify-center gap-2 border-[3px] border-dashed px-4 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 ${isLightMode
              ? "border-black/30 text-black/50 hover:border-black/60 hover:text-black"
              : "border-white/20 text-white/40 hover:border-white/40 hover:text-white hover:text-white/70"
              }`}
          >
            + Add Images
          </label>
          <input
            id="image-upload"
            type="file"
            accept={"image" + "\u002F" + "png,image" + "\u002F" + "jpeg,image" + "\u002F" + "webp"}
            multiple
            onChange={onImageChange}
            className="hidden"
          ></input>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving || (!submissionsEnabled && !isAdmin)}
          className={`relative flex items-center justify-center gap-3 border-[3px] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode
            ? "border-black bg-[#ff00a0] text-white shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000]"
            : "border-white bg-[#ff00a0] text-white shadow-[6px_6px_0_#fff] hover:shadow-[8px_8px_0_#c0ff00]"
            }`}
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="sm"></LoadingSpinner>
              Saving...
            </>
          ) : !submissionsEnabled && !isAdmin ? (
            "Submissions Closed"
          ) : isExisting ? (
            "Update Project"
          ) : (
            "Submit Project"
          )}
        </button>
      </div>
    </form>
  );
}
