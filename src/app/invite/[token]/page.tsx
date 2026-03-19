import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RSVPForm from "@/components/RSVPForm";
import Image from "next/image";

// In Next 15, page params are a Promise.
export default async function InviteLandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const guest = await prisma.guest.findUnique({
    where: { token },
    include: {
      event: true,
    },
  });

  if (!guest || !guest.event) {
    notFound();
  }

  const { event } = guest;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(event.date);

  // Background style handling
  const hasCustomBg = !!(event.backgroundImage || event.backgroundVideo);
  
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* Left: Media Asset (Sticky on Desktop) */}
      <div className="w-full lg:w-1/2 h-[40dvh] lg:h-[100dvh] relative lg:sticky lg:top-0 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800">
        {event.backgroundVideo ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-screen"
          >
            <source src={event.backgroundVideo} type="video/mp4" />
          </video>
        ) : event.backgroundImage ? (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat grayscale opacity-80"
            style={{ backgroundImage: `url(${event.backgroundImage})` }}
          />
        ) : (
          /* Premium fallback gradient */
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
             <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] -z-10 rounded-full" />
             <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-500/10 blur-[150px] -z-10 rounded-full" />
          </div>
        )}
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-zinc-950/20 mix-blend-multiply" />
        
        {/* Floating elements indicating it's an invite */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12">
           <div className="px-4 py-1.5 rounded-full bg-zinc-950/50 backdrop-blur-md border border-white/10 text-xs font-semibold tracking-widest uppercase text-zinc-300">
             Official Invitation
           </div>
        </div>
      </div>

      {/* Right: Content & Form (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        
        <div className="max-w-xl w-full mx-auto">
          {/* Typographic Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.9] mb-8 text-white">
              {event.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-medium mb-12">
              {event.description}
            </p>
            
            {/* Minimalist Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-800/50">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">When</p>
                <p className="font-medium text-lg leading-snug">{formattedDate}</p>
                <p className="text-zinc-400">{event.time}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">Where</p>
                <p className="font-medium text-lg leading-snug max-w-[250px]">{event.location}</p>
              </div>
            </div>
          </div>

          {/* RSVP Form */}
          <div className="pt-12 border-t border-zinc-800">
            <RSVPForm 
              token={guest.token}
              guestName={guest.name}
              initialStatus={guest.rsvpStatus}
              initialPlusOnes={guest.plusOnes}
              initialDietary={guest.dietaryRestrictions}
              initialNotes={guest.notes}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
