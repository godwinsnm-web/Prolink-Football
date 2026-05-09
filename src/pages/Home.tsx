import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { MapPin, Clock, CalendarDays, Ticket } from 'lucide-react';
import { useLocation } from 'wouter';

export type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  playingSlots: number;
  watchingSlots: number;
  playingBooked: number;
  watchingBooked: number;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) setEvents(await res.json());
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBook = async (eventId: number, type: 'play' | 'watch') => {
    if (!user) {
      toast.error('Please login to book tickets');
      setLocation('/login');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Successfully booked to ${type}!`);
      // Update local state without full refetch
      setEvents(events.map(e => e.id === eventId ? data : e));
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading events...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Upcoming Football Events</h1>
        <p className="text-slate-400 text-lg">Book your spot to play on the pitch or watch from the stands.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => {
          const playingAvailable = event.playingSlots - event.playingBooked;
          const watchingAvailable = event.watchingSlots - event.watchingBooked;

          return (
            <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors flex flex-col">
              <div className="h-48 bg-slate-800 relative">
                {/* Temporary placeholder background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-slate-400 text-center">
                        <span className="font-semibold text-white">{playingAvailable}</span> playing slots left
                      </div>
                      <button
                        onClick={() => handleBook(event.id, 'play')}
                        disabled={playingAvailable === 0}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Ticket className="w-4 h-4" /> Book to Play
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-slate-400 text-center">
                        <span className="font-semibold text-white">{watchingAvailable}</span> watching slots left
                      </div>
                      <button
                        onClick={() => handleBook(event.id, 'watch')}
                        disabled={watchingAvailable === 0}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Ticket className="w-4 h-4" /> Book to Watch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No upcoming events available.
        </div>
      )}
    </div>
  );
}
