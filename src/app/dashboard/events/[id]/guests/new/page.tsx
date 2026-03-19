"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CSVUpload from "@/components/CSVUpload";

export default function AddGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${resolvedParams.id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add guest");
      }

      router.push(`/dashboard/events/${resolvedParams.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/events/${resolvedParams.id}`} className="text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          &larr; Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Add Guests</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Single Guest Form */}
        <div className="bento-box shadow-lg bg-white/80 border border-zinc-200/50 p-8">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200/60 pb-3 mb-6">Add Single Guest</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Full Name *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm"
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-zinc-500 mt-2 font-medium">Provide at least an email or phone number to send invites.</p>
            </div>

            <div className="pt-6 border-t border-zinc-200/60">
              <button
                type="submit"
                disabled={loading}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-8 py-3.5 rounded-xl disabled:opacity-50 flex w-full justify-center items-center transition-all shadow-md active:scale-95"
              >
                {loading ? "Adding..." : "Add Guest"}
              </button>
            </div>
          </form>
        </div>

        {/* CSV Bulk Import Placeholder */}
        <div className="bento-box shadow-lg bg-zinc-100/50 border border-zinc-200/50 p-8">
          <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-200/60 pb-3 mb-6">Bulk Import</h2>
          <CSVUpload eventId={resolvedParams.id} onSuccess={() => {
            router.push(`/dashboard/events/${resolvedParams.id}`);
            router.refresh();
          }} />
        </div>
      </div>
    </div>
  );
}
