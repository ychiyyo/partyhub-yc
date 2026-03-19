"use client";

import { useState } from "react";
import { Guest } from "@prisma/client";

interface GuestTableProps {
  guests: Guest[];
  eventId: string;
}

export default function GuestTable({ guests, eventId }: GuestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "yes":
        return <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-medium">Attending</span>;
      case "no":
        return <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs font-medium">Declined</span>;
      case "maybe":
        return <span className="bg-accent-primary/20 text-accent-primary px-2 py-1 rounded-full text-xs font-medium">Maybe</span>;
      default:
        return <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search guests by name or email..."
          className="w-full bg-white/80 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all shadow-sm max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 text-sm font-semibold">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Plus Ones</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 font-medium">
                  No guests found.
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-zinc-200/60 hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900">{guest.name}</td>
                  <td className="py-3 px-4 text-sm text-zinc-500 font-medium">
                    <div className="flex flex-col">
                      <span>{guest.email || "—"}</span>
                      <span className="text-xs">{guest.phone || "—"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(guest.rsvpStatus)}</td>
                  <td className="py-3 px-4 text-center text-zinc-700 font-medium">{guest.plusOnes > 0 ? `+${guest.plusOnes}` : "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      className="text-zinc-400 hover:text-zinc-900 font-medium text-sm transition-colors"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/${guest.token}`)}
                      title="Copy Private Invite Link"
                    >
                      🔗 Link
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
