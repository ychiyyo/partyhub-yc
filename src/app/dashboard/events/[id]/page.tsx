import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RSVPStats from "@/components/RSVPStats";
import GuestTable from "@/components/GuestTable";
import NotificationPanel from "@/components/NotificationPanel";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
      include: {
        guests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) {
      notFound();
    }

    // Calculate stats
    const stats = { yes: 0, no: 0, maybe: 0, pending: 0 };
    let totalPlusOnes = 0;

    event.guests.forEach((guest: any) => {
      if (stats[guest.rsvpStatus as keyof typeof stats] !== undefined) {
        stats[guest.rsvpStatus as keyof typeof stats] += 1;
      }
      if (guest.rsvpStatus === "yes") {
        totalPlusOnes += guest.plusOnes;
      }
    });

    const formattedDate = event.date ? new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(event.date)) : "No date set";

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${event.slug}`;

    return (
      <div className="animate-fade-in pb-12">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm mb-2 inline-block font-medium">
              &larr; Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{event.title}</h1>
            <p className="text-zinc-500 mt-1 font-medium">
              {formattedDate} at {event.time} • {event.location}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-medium px-6 py-3.5 rounded-xl transition-all shadow-sm flex-1 sm:flex-none justify-center">Edit Event</button>
            <Link href={`/dashboard/events/${event.id}/guests/new`} className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-md flex-1 sm:flex-none flex justify-center text-center items-center active:scale-95">
              + Add Guests
            </Link>
          </div>
        </div>

        <RSVPStats stats={stats} totalPlusOnes={totalPlusOnes} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Guest List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bento-box shadow-lg bg-white/80 border border-zinc-200/50 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-200/60 pb-4">
                <h2 className="text-xl font-bold text-zinc-900">Guest List</h2>
              </div>
              
              <GuestTable guests={event.guests} eventId={event.id} />
            </div>
          </div>

          {/* Sidebar: Event Info & Actions */}
          <div className="space-y-6">
            <div className="bento-box shadow-lg bg-white/80 border border-zinc-200/50 p-6 md:p-8">
              <h3 className="text-lg font-bold mb-4 text-zinc-900 border-b border-zinc-200/60 pb-3">Event Details</h3>
              <div className="space-y-4 text-sm text-zinc-600 font-medium">
                <div>
                  <strong className="block text-zinc-900 mb-1">Description</strong>
                  <p>{event.description || "No description provided."}</p>
                </div>
                <div>
                  <strong className="block text-zinc-900 mb-1">Custom Design</strong>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${event.backgroundImage || event.backgroundVideo ? "bg-emerald-500" : "bg-zinc-300"}`}></span>
                    {event.backgroundImage || event.backgroundVideo ? "Media uploaded" : "Default theme"}
                  </div>
                </div>
              </div>
            </div>

            <NotificationPanel eventId={event.id} />
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 bento-box bg-red-50 border border-red-200 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error Loading Event</h1>
        <p className="font-mono text-sm whitespace-pre-wrap">{error.message}</p>
        <div className="mt-4">
          <Link href="/dashboard" className="text-red-700 underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }
}
