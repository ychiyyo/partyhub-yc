"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";

export default function CreateEventPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let backgroundImage = null;
      let backgroundVideo = null;

      // 1. Upload file if exists
      if (file) {
        const fileForm = new FormData();
        fileForm.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileForm,
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed");
        
        const uploadData = await uploadRes.json();
        if (uploadData.type === 'image') backgroundImage = uploadData.url;
        if (uploadData.type === 'video') backgroundVideo = uploadData.url;
      }

      // 2. Create Event
      const eventRes = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          backgroundImage,
          backgroundVideo
        }),
      });

      if (!eventRes.ok) {
        const errorData = await eventRes.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      const eventData = await eventRes.json();
      
      router.push(`/dashboard/events/${eventData.id}`);
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Create New Event</h1>
      </div>

      <div className="bento-box shadow-lg bg-white/80 border border-zinc-200/50 p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200/60 pb-3">Event Details</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Event Title *</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm text-lg font-medium"
                placeholder="E.g., Sarah's 30th Birthday Bash"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm min-h-[120px] resize-y"
                placeholder="Tell your guests what to expect..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">Date *</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">Time *</label>
                <input
                  required
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Location *</label>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                placeholder="123 Party Street, NY or Google Maps Link"
              />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-zinc-200/60">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200/60 pb-3 mb-2">Invite Design</h2>
              <p className="text-sm text-zinc-500 font-medium">
                Upload a background image or short looping video for your invite landing page to make it stand out.
              </p>
            </div>
            
            <FileUpload 
              label="Background Media (Optional)"
              accept="image/*,video/*"
              onChange={(f) => setFile(f)}
              helperText="Recommended: 1920x1080px (16:9 ratio). Max video size 20MB."
            />
          </div>

          <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-3 border-t border-zinc-200/60">
            <Link href="/dashboard" className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-medium px-6 py-3.5 rounded-xl transition-all shadow-sm text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-8 py-3.5 rounded-xl disabled:opacity-50 flex justify-center items-center transition-all shadow-md active:scale-95"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
