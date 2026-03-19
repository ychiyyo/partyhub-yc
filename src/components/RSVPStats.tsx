interface RSVPStatsProps {
  stats: {
    yes: number;
    no: number;
    maybe: number;
    pending: number;
  };
  totalPlusOnes: number;
}

export default function RSVPStats({ stats, totalPlusOnes }: RSVPStatsProps) {
  const totalInvited = stats.yes + stats.no + stats.maybe + stats.pending;
  const totalAttending = stats.yes; // Note: plus ones are counted separately for clarity

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x divide-zinc-800/50 mb-12">
      <div className="px-6 flex flex-col justify-center">
        <p className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mb-2">Attending</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-mono text-emerald-400 tracking-tighter">{totalAttending}</span>
          {totalPlusOnes > 0 && (
            <span className="text-zinc-500 text-sm font-mono">(+{totalPlusOnes})</span>
          )}
        </div>
      </div>

      <div className="px-6 flex flex-col justify-center">
        <p className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mb-2">Pending</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-mono text-zinc-300 tracking-tighter">{stats.pending}</span>
          <span className="text-zinc-500 text-sm font-mono">/ {totalInvited}</span>
        </div>
      </div>

      <div className="px-6 flex flex-col justify-center">
        <p className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mb-2">Maybe</p>
        <span className="text-4xl md:text-5xl font-mono text-zinc-300 tracking-tighter">{stats.maybe}</span>
      </div>

      <div className="px-6 flex flex-col justify-center border-r border-zinc-800/50">
        <p className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mb-2">Declined</p>
        <span className="text-4xl md:text-5xl font-mono text-zinc-500 tracking-tighter">{stats.no}</span>
      </div>
    </div>
  );
}
