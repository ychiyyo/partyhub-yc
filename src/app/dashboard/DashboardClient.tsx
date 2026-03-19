"use client";

import Link from "next/link";
import { PlusIcon, CalendarIcon } from "@radix-ui/react-icons";
import EventCard from "@/components/EventCard";
import { motion, Variants } from "framer-motion";

interface DashboardClientProps {
  events: any[]; // Formatted events from server
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

export default function DashboardClient({ events }: DashboardClientProps) {
  return (
    <div className="max-w-7xl mx-auto pt-8 pb-20 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-zinc-900">
            Upcoming Events
          </h1>
          <p className="text-zinc-500 max-w-sm leading-relaxed">
            Manage your guest lists and track RSVPs across all your high-profile gatherings.
          </p>
        </div>
        <Link 
          href="/dashboard/events/new" 
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors active:scale-95 duration-200 shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Event</span>
        </Link>
      </div>

      {events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bento-box flex flex-col items-center justify-center text-center py-32"
        >
          <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-6 shadow-sm">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-3 tracking-tight">No active events</h3>
          <p className="text-zinc-500 max-w-sm mb-8">
            You haven't orchestrated any events yet. The canvas is blank.
          </p>
          <Link 
            href="/dashboard/events/new" 
            className="inline-flex items-center justify-center bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900 px-6 py-3 rounded-full font-medium transition-colors active:scale-95 duration-200 shadow-md"
          >
            Start Planning
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 auto-rows-[300px]"
        >
          {events.map((event, i) => (
            <motion.div key={event.id} variants={itemVariants} className={`
              ${i % 3 === 0 ? 'lg:col-span-2' : ''} 
            `}>
              <EventCard 
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                stats={event.stats}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
