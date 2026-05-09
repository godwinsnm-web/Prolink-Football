import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

let events = [
  { id: 1, title: 'ProLink Summer Cup Final', date: '2026-07-26', time: '19:00', venue: 'Wembley Stadium', playingSlots: 22, watchingSlots: 3000, playingBooked: 18, watchingBooked: 1540 },
  { id: 2, title: 'Amateur League Matchday 1', date: '2026-06-15', time: '14:00', venue: 'London Stadium', playingSlots: 22, watchingSlots: 500, playingBooked: 22, watchingBooked: 210 },
  { id: 3, title: 'Charity Match: Legends vs Fans', date: '2026-08-10', time: '16:00', venue: 'Stamford Bridge', playingSlots: 30, watchingSlots: 4000, playingBooked: 5, watchingBooked: 3950 }
];

let players = [
  { id: 1, rank: 1, name: 'Lionel Messi', position: 'Forward', stats: '821 Goals / 361 Assists', club: 'Inter Miami', marketValue: '€35M' },
  { id: 2, rank: 2, name: 'Cristiano Ronaldo', position: 'Forward', stats: '873 Goals / 245 Assists', club: 'Al Nassr', marketValue: '€15M' },
  { id: 3, rank: 3, name: 'Kylian Mbappé', position: 'Forward', stats: '315 Goals / 120 Assists', club: 'Real Madrid', marketValue: '€180M' },
  { id: 4, rank: 4, name: 'Erling Haaland', position: 'Forward', stats: '235 Goals / 52 Assists', club: 'Manchester City', marketValue: '€180M' },
  { id: 5, rank: 5, name: 'Jude Bellingham', position: 'Midfielder', stats: '50 Goals / 45 Assists', club: 'Real Madrid', marketValue: '€150M' },
  { id: 6, rank: 6, name: 'Kevin De Bruyne', position: 'Midfielder', stats: '148 Goals / 285 Assists', club: 'Manchester City', marketValue: '€60M' },
  { id: 7, rank: 7, name: 'Vinicius Junior', position: 'Forward', stats: '85 Goals / 78 Assists', club: 'Real Madrid', marketValue: '€150M' },
  { id: 8, rank: 8, name: 'Harry Kane', position: 'Forward', stats: '390 Goals / 95 Assists', club: 'Bayern Munich', marketValue: '€110M' },
  { id: 9, rank: 9, name: 'Mohamed Salah', position: 'Forward', stats: '320 Goals / 140 Assists', club: 'Liverpool', marketValue: '€65M' },
  { id: 10, rank: 10, name: 'Rodri', position: 'Midfielder', stats: '30 Goals / 40 Assists', club: 'Manchester City', marketValue: '€110M' },
  { id: 11, rank: 11, name: 'Phil Foden', position: 'Midfielder', stats: '80 Goals / 55 Assists', club: 'Manchester City', marketValue: '€130M' },
  { id: 12, rank: 12, name: 'Bukayo Saka', position: 'Forward', stats: '65 Goals / 62 Assists', club: 'Arsenal', marketValue: '€120M' },
  { id: 13, rank: 13, name: 'Jamal Musiala', position: 'Midfielder', stats: '50 Goals / 35 Assists', club: 'Bayern Munich', marketValue: '€110M' },
  { id: 14, rank: 14, name: 'Martin Ødegaard', position: 'Midfielder', stats: '45 Goals / 60 Assists', club: 'Arsenal', marketValue: '€95M' },
  { id: 15, rank: 15, name: 'Pedri', position: 'Midfielder', stats: '25 Goals / 30 Assists', club: 'Barcelona', marketValue: '€90M' },
  { id: 16, rank: 16, name: 'Virgil van Dijk', position: 'Defender', stats: '45 Goals / 15 Assists', club: 'Liverpool', marketValue: '€32M' },
  { id: 17, rank: 17, name: 'Rúben Dias', position: 'Defender', stats: '15 Goals / 10 Assists', club: 'Manchester City', marketValue: '€80M' },
  { id: 18, rank: 18, name: 'Alisson Becker', position: 'Goalkeeper', stats: '1 Goal / 185 Clean Sheets', club: 'Liverpool', marketValue: '€32M' },
  { id: 19, rank: 19, name: 'Achraf Hakimi', position: 'Defender', stats: '40 Goals / 65 Assists', club: 'Paris SG', marketValue: '€65M' },
  { id: 20, rank: 20, name: 'Federico Valverde', position: 'Midfielder', stats: '35 Goals / 40 Assists', club: 'Real Madrid', marketValue: '€100M' }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API ROUTES
  
  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
      return res.json({ token: 'admin-token', role: 'ADMIN', username });
    }
    // Mock general user access
    if (username && password) {
      return res.json({ token: 'user-token', role: 'USER', username });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { username } = req.body;
    if (username) {
      return res.json({ message: 'A password recovery link has been sent to your email.' });
    }
    res.status(400).json({ error: 'Username or email required' });
  });

  // Events
  app.get('/api/events', (req, res) => {
    res.json(events);
  });

  app.post('/api/events', (req, res) => {
    const newEvent = { id: Date.now(), ...req.body, playingBooked: 0, watchingBooked: 0 };
    events.push(newEvent);
    res.json(newEvent);
  });

  app.put('/api/events/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...req.body };
      res.json(events[index]);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  });

  app.delete('/api/events/:id', (req, res) => {
    const id = parseInt(req.params.id);
    events = events.filter(e => e.id !== id);
    res.json({ success: true });
  });

  // Bookings
  app.post('/api/events/:id/book', (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body; // 'play' or 'watch'
    const event = events.find(e => e.id === id);
    
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (type === 'play') {
      if (event.playingBooked >= event.playingSlots) return res.status(400).json({ error: 'Playing slots are fully booked.' });
      event.playingBooked += 1;
    } else if (type === 'watch') {
      if (event.watchingBooked >= event.watchingSlots) return res.status(400).json({ error: 'Watching slots are fully booked.' });
      event.watchingBooked += 1;
    } else {
      return res.status(400).json({ error: 'Invalid booking type' });
    }

    res.json(event);
  });

  // Players
  app.get('/api/players', (req, res) => {
    res.json([...players].sort((a, b) => a.rank - b.rank));
  });

  app.put('/api/players/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = players.findIndex(p => p.id === id);
    if (index !== -1) {
      players[index] = { ...players[index], ...req.body };
      res.json(players[index]);
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  });


  // Vite middleware for development / Static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
