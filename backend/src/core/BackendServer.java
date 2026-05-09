package core;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.util.*;
import java.util.stream.Collectors;

public class BackendServer {
    static class Event {
        long id; String title; String date; String time; String venue;
        int playingSlots; int watchingSlots; int playingBooked; int watchingBooked;
        
        public String toJson() {
            return String.format("{\"id\":%d,\"title\":\"%s\",\"date\":\"%s\",\"time\":\"%s\",\"venue\":\"%s\",\"playingSlots\":%d,\"watchingSlots\":%d,\"playingBooked\":%d,\"watchingBooked\":%d}",
                id, escape(title), escape(date), escape(time), escape(venue), playingSlots, watchingSlots, playingBooked, watchingBooked);
        }
    }

    static class Player {
        long id; int rank; String name; String position; String stats; String club; String marketValue;
        
        public String toJson() {
            return String.format("{\"id\":%d,\"rank\":%d,\"name\":\"%s\",\"position\":\"%s\",\"stats\":\"%s\",\"club\":\"%s\",\"marketValue\":\"%s\"}",
                id, rank, escape(name), escape(position), escape(stats), escape(club), escape(marketValue));
        }
    }
    
    static String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }

    static List<Event> events = new ArrayList<>();
    static List<Player> players = new ArrayList<>();
    static long eventIdCounter = 4; 

    public static void main(String[] args) throws IOException {
        initData();

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        server.createContext("/api/auth/login", new AuthLoginHandler());
        server.createContext("/api/auth/forgot-password", new AuthForgotHandler());
        server.createContext("/api/events", new EventsHandler());
        server.createContext("/api/players", new PlayersHandler());
        
        server.setExecutor(null);
        server.start();
        System.out.println("ProLink Java Backend Server started on port 8080");
    }

    static void initData() {
        Event e1 = new Event(); e1.id = 1; e1.title = "ProLink Summer Cup Final"; e1.date = "2026-07-26"; e1.time = "19:00"; e1.venue = "Wembley Stadium"; e1.playingSlots = 22; e1.watchingSlots = 3000; e1.playingBooked = 18; e1.watchingBooked = 1540;
        Event e2 = new Event(); e2.id = 2; e2.title = "Amateur League Matchday 1"; e2.date = "2026-06-15"; e2.time = "14:00"; e2.venue = "London Stadium"; e2.playingSlots = 22; e2.watchingSlots = 500; e2.playingBooked = 22; e2.watchingBooked = 210;
        Event e3 = new Event(); e3.id = 3; e3.title = "Charity Match: Legends vs Fans"; e3.date = "2026-08-10"; e3.time = "16:00"; e3.venue = "Stamford Bridge"; e3.playingSlots = 30; e3.watchingSlots = 4000; e3.playingBooked = 5; e3.watchingBooked = 3950;
        events.addAll(Arrays.asList(e1, e2, e3));

        Player p1 = new Player(); p1.id = 1; p1.rank = 1; p1.name = "Lionel Messi"; p1.position = "Forward"; p1.stats = "821 Goals / 361 Assists"; p1.club = "Inter Miami"; p1.marketValue = "€35M";
        Player p2 = new Player(); p2.id = 2; p2.rank = 2; p2.name = "Cristiano Ronaldo"; p2.position = "Forward"; p2.stats = "873 Goals / 245 Assists"; p2.club = "Al Nassr"; p2.marketValue = "€15M";
        Player p3 = new Player(); p3.id = 3; p3.rank = 3; p3.name = "Kylian Mbappé"; p3.position = "Forward"; p3.stats = "315 Goals / 120 Assists"; p3.club = "Real Madrid"; p3.marketValue = "€180M";
        Player p4 = new Player(); p4.id = 4; p4.rank = 4; p4.name = "Jude Bellingham"; p4.position = "Midfielder"; p4.stats = "50 Goals / 45 Assists"; p4.club = "Real Madrid"; p4.marketValue = "€150M";
        players.addAll(Arrays.asList(p1, p2, p3, p4));
    }

    static void setCors(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    static String readBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    static String extractJsonField(String json, String field) {
        String marker = "\"" + field + "\":";
        int idx = json.indexOf(marker);
        if (idx == -1) return null;
        int start = idx + marker.length();
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '\n')) start++;
        if (json.charAt(start) == '"') {
            int end = json.indexOf('"', start + 1);
            return json.substring(start + 1, end).replace("\\\"", "\"");
        } else {
            int end = start;
            while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}' && json.charAt(end) != ' ' && json.charAt(end) != '\n') end++;
            return json.substring(start, end).replace("\"", "");
        }
    }

    static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes("UTF-8");
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    static class AuthLoginHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            setCors(t);
            if ("OPTIONS".equals(t.getRequestMethod())) { t.sendResponseHeaders(204, -1); return; }
            if ("POST".equals(t.getRequestMethod())) {
                String body = readBody(t);
                String username = extractJsonField(body, "username");
                String password = extractJsonField(body, "password");
                if ("admin".equals(username) && "admin".equals(password)) {
                    sendResponse(t, 200, "{\"token\":\"admin-token\",\"role\":\"ADMIN\",\"username\":\"" + username + "\"}");
                } else if (username != null && password != null) {
                    sendResponse(t, 200, "{\"token\":\"user-token\",\"role\":\"USER\",\"username\":\"" + username + "\"}");
                } else {
                    sendResponse(t, 401, "{\"error\":\"Invalid credentials\"}");
                }
            }
        }
    }

    static class AuthForgotHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            setCors(t);
            if ("OPTIONS".equals(t.getRequestMethod())) { t.sendResponseHeaders(204, -1); return; }
            if ("POST".equals(t.getRequestMethod())) {
                String body = readBody(t);
                String username = extractJsonField(body, "username");
                if (username != null) {
                    sendResponse(t, 200, "{\"message\":\"A password recovery link has been sent to your email.\"}");
                } else {
                    sendResponse(t, 400, "{\"error\":\"Username or email required\"}");
                }
            }
        }
    }

    static class EventsHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            setCors(t);
            String method = t.getRequestMethod();
            String path = t.getRequestURI().getPath();
            if ("OPTIONS".equals(method)) { t.sendResponseHeaders(204, -1); return; }

            String[] parts = path.split("/");
            long id = -1;
            if (parts.length >= 4) {
                try { id = Long.parseLong(parts[3]); } catch (Exception e) {}
            }

            if ("GET".equals(method)) {
                String json = "[" + events.stream().map(Event::toJson).collect(Collectors.joining(",")) + "]";
                sendResponse(t, 200, json);
            } else if ("POST".equals(method)) {
                String body = readBody(t);
                if (parts.length >= 5 && "book".equals(parts[4])) {
                    // /api/events/:id/book
                    String type = extractJsonField(body, "type");
                    for (Event e : events) {
                        if (e.id == id) {
                            if ("play".equals(type)) {
                                if (e.playingBooked >= e.playingSlots) { sendResponse(t, 400, "{\"error\":\"Fully booked\"}"); return; }
                                e.playingBooked++;
                            } else if ("watch".equals(type)) {
                                if (e.watchingBooked >= e.watchingSlots) { sendResponse(t, 400, "{\"error\":\"Fully booked\"}"); return; }
                                e.watchingBooked++;
                            }
                            sendResponse(t, 200, e.toJson());
                            return;
                        }
                    }
                    sendResponse(t, 404, "{\"error\":\"Not found\"}");
                    return;
                }
                
                // create event
                Event e = new Event();
                e.id = eventIdCounter++;
                e.title = extractJsonField(body, "title");
                e.date = extractJsonField(body, "date");
                e.time = extractJsonField(body, "time");
                e.venue = extractJsonField(body, "venue");
                e.playingSlots = Integer.parseInt(extractJsonField(body, "playingSlots"));
                e.watchingSlots = Integer.parseInt(extractJsonField(body, "watchingSlots"));
                e.playingBooked = 0; e.watchingBooked = 0;
                events.add(e);
                sendResponse(t, 200, e.toJson());
            } else if ("PUT".equals(method)) {
                String body = readBody(t);
                for (Event e : events) {
                    if (e.id == id) {
                        String tTitle = extractJsonField(body, "title"); if(tTitle!=null) e.title=tTitle;
                        String tDate = extractJsonField(body, "date"); if(tDate!=null) e.date=tDate;
                        String tTime = extractJsonField(body, "time"); if(tTime!=null) e.time=tTime;
                        String tVenue = extractJsonField(body, "venue"); if(tVenue!=null) e.venue=tVenue;
                        String pSlots = extractJsonField(body, "playingSlots"); if(pSlots!=null) e.playingSlots=Integer.parseInt(pSlots);
                        String wSlots = extractJsonField(body, "watchingSlots"); if(wSlots!=null) e.watchingSlots=Integer.parseInt(wSlots);
                        sendResponse(t, 200, e.toJson());
                        return;
                    }
                }
                sendResponse(t, 404, "{\"error\":\"Not found\"}");
            } else if ("DELETE".equals(method)) {
                long finalId = id;
                events.removeIf(e -> e.id == finalId);
                sendResponse(t, 200, "{\"success\":true}");
            }
        }
    }

    static class PlayersHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            setCors(t);
            String method = t.getRequestMethod();
            String path = t.getRequestURI().getPath();
            if ("OPTIONS".equals(method)) { t.sendResponseHeaders(204, -1); return; }

            String[] parts = path.split("/");
            long id = -1;
            if (parts.length >= 4) {
                try { id = Long.parseLong(parts[3]); } catch (Exception e) {}
            }

            if ("GET".equals(method)) {
                players.sort(Comparator.comparingInt(p -> p.rank));
                String json = "[" + players.stream().map(Player::toJson).collect(Collectors.joining(",")) + "]";
                sendResponse(t, 200, json);
            } else if ("PUT".equals(method)) {
                String body = readBody(t);
                for (Player p : players) {
                    if (p.id == id) {
                        String name = extractJsonField(body, "name"); if(name!=null) p.name=name;
                        String rank = extractJsonField(body, "rank"); if(rank!=null) p.rank=Integer.parseInt(rank);
                        String pos = extractJsonField(body, "position"); if(pos!=null) p.position=pos;
                        String club = extractJsonField(body, "club"); if(club!=null) p.club=club;
                        String stats = extractJsonField(body, "stats"); if(stats!=null) p.stats=stats;
                        String val = extractJsonField(body, "marketValue"); if(val!=null) p.marketValue=val;
                        sendResponse(t, 200, p.toJson());
                        return;
                    }
                }
                sendResponse(t, 404, "{\"error\":\"Not found\"}");
            }
        }
    }
}
