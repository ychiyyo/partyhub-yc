"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarIcon, DividerHorizontalIcon, PersonIcon } from "@radix-ui/react-icons";

interface EventCardProps {
  id: string;
  title: string;
  date: Date;
  location: string;
  stats: {
    yes: number;
    no: number;
    maybe: number;
    pending: number;
  };
}

export default function EventCard({ id, title, date, location, stats }: EventCardProps) {
  const total = stats.yes + stats.no + stats.maybe + stats.pending;
  const yesPercent = total > 0 ? (stats.yes / total) * 100 : 0;
  
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }).format(date);

  return (
    <motion.div
      layoutId={`event-${id}`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98, y: -1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="bento-box flex flex-col justify-between h-full group cursor-pointer"
    >
      <Link href={`/dashboard/events/${id}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />
      
      <div className="relative z-0">
        <div className="flex justify-between items-start mb-8">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-zinc-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
            <PersonIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-mono text-zinc-700 font-semibold">{total}</span>
          </div>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">{title}</h3>
        <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
          <span>{formattedDate}</span>
          <DividerHorizontalIcon className="w-3 h-3 opacity-30" />
          <span className="truncate max-w-[150px]">{location}</span>
        </div>
      </div>

      <div className="space-y-3 mt-10 relative z-0">
        <div className="flex justify-between items-end text-xs">
          <span className="text-zinc-500 uppercase tracking-widest font-bold">RSVPs</span>
          <span className="font-mono text-emerald-600 font-bold">{stats.yes} Yes</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${yesPercent}%` }}
            transition={{ delay: 0.2, type: "spring", stiffness: 50, damping: 15 }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>
    </motion.div>
  );
}
