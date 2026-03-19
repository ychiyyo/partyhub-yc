import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardOverview() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      guests: {
        select: { rsvpStatus: true, plusOnes: true }
      }
    }
  });

  const formattedEvents = events.map(event => {
    const stats = { yes: 0, no: 0, maybe: 0, pending: 0 };

    event.guests.forEach((guest) => {
      if (guest.rsvpStatus === 'yes') {
        stats.yes += (1 + guest.plusOnes);
      } else if (stats[guest.rsvpStatus as keyof typeof stats] !== undefined) {
        stats[guest.rsvpStatus as keyof typeof stats] += 1;
      }
    });

    return { ...event, stats };
  });

  return <DashboardClient events={formattedEvents} />;
}
