import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export type Player = {
  id: number;
  rank: number;
  name: string;
  position: string;
  stats: string;
  club: string;
  marketValue: string;
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to fetch players');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading players...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Top 20 Players Globally</h1>
        <p className="text-slate-400 text-lg">A curated showcase of the world's most elite football talent based on performance and market value.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {players.map(player => (
          <div key={player.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-600 rounded-bl-2xl flex items-center justify-center shadow-lg z-10">
              <span className="text-white font-bold text-lg">#{player.rank}</span>
            </div>
            
            {/* Player Avatar Placeholder */}
            <div className="h-40 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center p-6 border-b border-slate-800">
               <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <span className="text-3xl font-bold text-slate-500">{player.name.charAt(0)}</span>
               </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-white leading-tight mb-1">{player.name}</h3>
              <p className="text-emerald-400 text-sm font-medium mb-4">{player.position}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Club</span>
                  <span className="text-white font-medium text-right">{player.club}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Stats</span>
                  <span className="text-white font-medium text-right">{player.stats}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Market Value</span>
                  <span className="text-emerald-400 font-bold text-right">{player.marketValue}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
