import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../AuthContext';
import { Event } from './Home';
import { Player } from './Players';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'events' | 'players'>('events');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Simple form state for creating a new event
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', venue: '', playingSlots: 22, watchingSlots: 500
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error('Unauthorized access');
      setLocation('/');
      return;
    }
    
    fetch('/api/events').then(res => res.json()).then(setEvents);
    fetch('/api/players').then(res => res.json()).then(setPlayers);
  }, [user, location, setLocation]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        const added = await res.json();
        setEvents([...events, added]);
        setNewEvent({ title: '', date: '', time: '', venue: '', playingSlots: 22, watchingSlots: 500 });
        toast.success('Event created');
      }
    } catch {
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(ev => ev.id !== id));
        toast.success('Event deleted');
      }
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent)
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents(events.map(ev => ev.id === editingEvent.id ? updated : ev));
        setEditingEvent(null);
        toast.success('Event updated');
      }
    } catch {
      toast.error('Failed to update event');
    }
  };

  const handleUpdatePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    try {
      const res = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayer)
      });
      if (res.ok) {
        const updated = await res.json();
        setPlayers(players.map(p => p.id === editingPlayer.id ? updated : p));
        setEditingPlayer(null);
        toast.success('Player updated');
      }
    } catch {
      toast.error('Failed to update player');
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-8 border-b border-slate-800">
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'events' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          onClick={() => setActiveTab('events')}
        >
          Manage Events
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'players' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          onClick={() => setActiveTab('players')}
        >
          Manage Players
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Create New Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                    <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Date</label>
                      <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Time</label>
                      <input required type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white [color-scheme:dark]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Venue</label>
                    <input required type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Playing Slots</label>
                      <input required type="number" value={newEvent.playingSlots} onChange={e => setNewEvent({...newEvent, playingSlots: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Watching Slots</label>
                      <input required type="number" value={newEvent.watchingSlots} onChange={e => setNewEvent({...newEvent, watchingSlots: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium mt-4">
                    Create Event
                  </button>
                </form>
             </div>
           </div>

           <div className="lg:col-span-2">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm">
                      <th className="p-4 font-medium">Event</th>
                      <th className="p-4 font-medium">Date/Time</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Bookings</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                         <td className="p-4">
                           <p className="font-medium text-white">{ev.title}</p>
                           <p className="text-xs text-slate-500">{ev.venue}</p>
                         </td>
                         <td className="p-4">
                           <p className="text-white text-sm">{ev.date}</p>
                           <p className="text-xs text-slate-500">{ev.time}</p>
                         </td>
                         <td className="p-4 hidden sm:table-cell">
                           <p className="text-xs text-slate-400">Play: {ev.playingBooked}/{ev.playingSlots}</p>
                           <p className="text-xs text-slate-400">Watch: {ev.watchingBooked}/{ev.watchingSlots}</p>
                         </td>
                         <td className="p-4 text-right space-x-3">
                           <button onClick={() => setEditingEvent(ev)} className="text-blue-500 hover:text-blue-400 text-sm font-medium">Edit</button>
                           <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-500 hover:text-red-400 text-sm font-medium">Delete</button>
                         </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No events found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
           <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">Player</th>
                <th className="p-4 font-medium hidden sm:table-cell">Current Stats</th>
                <th className="p-4 font-medium hidden md:table-cell">Market Value</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                   <td className="p-4 font-bold text-emerald-500">#{player.rank}</td>
                   <td className="p-4">
                     <p className="font-medium text-white">{player.name}</p>
                     <p className="text-xs text-slate-500">{player.club} • {player.position}</p>
                   </td>
                   <td className="p-4 text-sm text-slate-300 hidden sm:table-cell">{player.stats}</td>
                   <td className="p-4 text-sm text-slate-300 hidden md:table-cell">{player.marketValue}</td>
                   <td className="p-4 text-right">
                     <button onClick={() => setEditingPlayer(player)} className="text-blue-500 hover:text-blue-400 text-sm font-medium">Edit</button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Event</h2>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUpdateEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input required type="text" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input required type="date" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Time</label>
                  <input required type="time" value={editingEvent.time} onChange={e => setEditingEvent({...editingEvent, time: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Venue</label>
                <input required type="text" value={editingEvent.venue} onChange={e => setEditingEvent({...editingEvent, venue: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Playing Slots</label>
                  <input required type="number" value={editingEvent.playingSlots} onChange={e => setEditingEvent({...editingEvent, playingSlots: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Watching Slots</label>
                  <input required type="number" value={editingEvent.watchingSlots} onChange={e => setEditingEvent({...editingEvent, watchingSlots: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Player</h2>
              <button onClick={() => setEditingPlayer(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUpdatePlayerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input required type="text" value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rank</label>
                  <input required type="number" value={editingPlayer.rank} onChange={e => setEditingPlayer({...editingPlayer, rank: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Position</label>
                  <input required type="text" value={editingPlayer.position} onChange={e => setEditingPlayer({...editingPlayer, position: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Club</label>
                  <input required type="text" value={editingPlayer.club} onChange={e => setEditingPlayer({...editingPlayer, club: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Stats</label>
                  <input required type="text" value={editingPlayer.stats} onChange={e => setEditingPlayer({...editingPlayer, stats: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Market Value</label>
                  <input required type="text" value={editingPlayer.marketValue} onChange={e => setEditingPlayer({...editingPlayer, marketValue: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingPlayer(null)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
