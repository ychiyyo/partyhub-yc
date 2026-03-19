"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NotificationPanelProps {
  eventId: string;
}

export default function NotificationPanel({ eventId }: NotificationPanelProps) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleNotify = async (type: 'invite' | 'reminder' | 'thankyou') => {
    setLoadingType(type);
    setMessage(null);

    // Confirm before sending mass texts/emails
    const confirmMessage = {
      invite: "Send invites to all pending guests?",
      reminder: "Send a reminder to all pending guests who haven't RSVP'd?",
      thankyou: "Send a thank you message to all guests who RSVP'd Yes?"
    }[type];

    if (!window.confirm(confirmMessage)) {
      setLoadingType(null);
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send notifications");
      }

      setMessage({ text: data.message, type: 'success' });
      router.refresh(); // Refresh to update notification logs if we add them to the UI later
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred", type: 'error' });
    } finally {
      setLoadingType(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    setLoadingType('delete');
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete", type: 'error' });
      setLoadingType(null);
    }
  };

  return (
    <div className="bento-box shadow-lg border border-emerald-200/60 bg-emerald-50/50 p-6 md:p-8">
      <h3 className="text-lg font-bold mb-4 text-zinc-900 border-b border-emerald-200/60 pb-3">Quick Actions</h3>
      
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm mb-4 font-medium ${
          message.type === 'success' ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <button 
          onClick={() => handleNotify('invite')}
          disabled={loadingType !== null}
          className="w-full text-left px-4 py-3.5 rounded-xl bg-white hover:bg-emerald-50 transition-colors border border-emerald-200/60 text-sm font-semibold text-zinc-800 disabled:opacity-50 relative shadow-sm"
        >
          {loadingType === 'invite' ? '✉️ Sending...' : '✉️ Send Invites to Pending'}
        </button>
        
        <button 
          onClick={() => handleNotify('reminder')}
          disabled={loadingType !== null}
          className="w-full text-left px-4 py-3.5 rounded-xl bg-white hover:bg-emerald-50 transition-colors border border-emerald-200/60 text-sm font-semibold text-zinc-800 disabled:opacity-50 relative shadow-sm"
        >
          {loadingType === 'reminder' ? '🔔 Sending...' : '🔔 Send Reminder SMS/Email'}
        </button>
        
        <button 
          onClick={() => handleNotify('thankyou')}
          disabled={loadingType !== null}
          className="w-full text-left px-4 py-3.5 rounded-xl bg-white hover:bg-emerald-50 transition-colors border border-emerald-200/60 text-sm font-semibold text-zinc-800 disabled:opacity-50 relative shadow-sm"
        >
          {loadingType === 'thankyou' ? '🎉 Sending...' : '🎉 Send Thank Yous (Attending)'}
        </button>
        
        <div className="my-5 border-t border-emerald-200/60"></div>
        
        <button 
          onClick={handleDelete}
          disabled={loadingType !== null}
          className="w-full text-left px-4 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 transition-colors border border-red-200 text-sm font-semibold text-red-600 disabled:opacity-50 shadow-sm"
        >
          {loadingType === 'delete' ? '🗑️ Deleting...' : '🗑️ Delete Event'}
        </button>
      </div>
    </div>
  );
}
