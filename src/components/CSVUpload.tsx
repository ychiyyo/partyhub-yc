"use client";

import { useState, useRef } from "react";

interface CSVUploadProps {
  eventId: string;
  onSuccess: () => void;
}

export default function CSVUpload({ eventId, onSuccess }: CSVUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/events/${eventId}/guests/import`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to import guests");
      }

      const data = await res.json();
      alert(`Successfully imported ${data.count} guests!`);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <p className="text-sm text-zinc-500 mb-4 font-medium">
        Upload a CSV file containing your guest list. The first row must include these exact column headers: <strong className="text-zinc-900">name</strong>, <strong className="text-zinc-900">email</strong>, <strong className="text-zinc-900">phone</strong>.
      </p>

      <div 
        className="border-2 border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl p-6 text-center cursor-pointer transition-colors shadow-sm bg-white/50"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv, text/csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm font-semibold text-zinc-700 mb-1">Click to upload CSV file</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-200/60">
        <a 
          href="data:text/csv;charset=utf-8,name,email,phone%0AJohn Doe,john@example.com,+1555000000" 
          download="partypulse_template.csv"
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors block text-center"
        >
          Download template CSV
        </a>
      </div>
    </div>
  );
}
