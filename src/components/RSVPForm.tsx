"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface RSVPFormProps {
  token: string;
  initialStatus: string;
  initialPlusOnes: number;
  initialDietary: string | null;
  initialNotes: string | null;
  guestName: string;
}

export default function RSVPForm({
  token,
  initialStatus,
  initialPlusOnes,
  initialDietary,
  initialNotes,
  guestName
}: RSVPFormProps) {
  const router = useRouter();
  
  const [status, setStatus] = useState(initialStatus === "pending" ? "" : initialStatus);
  const [plusOnes, setPlusOnes] = useState(initialPlusOnes.toString());
  const [dietary, setDietary] = useState(initialDietary || "");
  const [notes, setNotes] = useState(initialNotes || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) {
      setError("Please select your attendance status first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpStatus: status,
          plusOnes: status === "yes" ? plusOnes : 0,
          dietaryRestrictions: dietary,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit RSVP. Please try again.");
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    status !== initialStatus || 
    plusOnes !== initialPlusOnes.toString() || 
    dietary !== (initialDietary||"") || 
    notes !== (initialNotes||"");

  return (
    <div className="bento-box relative overflow-hidden w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Hello, {guestName}</h2>
        <p className="text-zinc-400">Please let us know if you can make it.</p>
      </div>

      <AnimatePresence mode="wait">
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-8"
          >
            <CheckCircledIcon className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-emerald-400 font-medium text-lg">Thank you! Your RSVP is confirmed.</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-8 text-red-400"
          >
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-left">
        
        {/* Status Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-zinc-400 block uppercase tracking-wider">Attendance</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'yes', label: 'Yes, attending' },
              { id: 'maybe', label: 'Maybe' },
              { id: 'no', label: 'Cannot attend' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id)}
                className={`relative overflow-hidden py-4 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  status === opt.id 
                  ? 'bg-zinc-800 border-zinc-700 text-white border' 
                  : 'bg-zinc-900/50 border border-white/5 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                {status === opt.id && (
                  <motion.div 
                    layoutId="activeStatusIndicator"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields */}
        <AnimatePresence initial={false}>
          {status === "yes" && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="space-y-8 overflow-hidden"
            >
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-zinc-400 block uppercase tracking-wider">Bringing a Plus One?</label>
                <div className="relative">
                  <select 
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                  >
                    <option value="0">Just me (+0)</option>
                    <option value="1">Yes (+1 guest)</option>
                    <option value="2">Yes (+2 guests)</option>
                    <option value="3">Yes (+3 guests)</option>
                  </select>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-zinc-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 block uppercase tracking-wider">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-xl px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  placeholder="e.g. Vegetarian, Peanut Allergy (Optional)"
                />
              </div>
            </motion.div>
          )}

          {status && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="space-y-3 pt-2 overflow-hidden"
            >
              <label className="text-sm font-medium text-zinc-400 block uppercase tracking-wider">Note for the Host</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-xl px-4 py-3 min-h-[100px] placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                placeholder={status === "no" ? "Sorry I can't make it..." : "Looking forward to it! (Optional)"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={status && hasChanges && !loading ? { scale: 1.02 } : {}}
          whileTap={status && hasChanges && !loading ? { scale: 0.98 } : {}}
          type="submit"
          disabled={loading || !status || (!hasChanges && initialStatus !== "pending")}
          className={`w-full h-14 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
            loading || !status || (!hasChanges && initialStatus !== "pending")
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent"
            : "bg-zinc-100 text-zinc-950 hover:bg-white border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            success ? "Update Submission" : "Confirm RSVP"
          )}
        </motion.button>
      </form>
    </div>
  );
}
