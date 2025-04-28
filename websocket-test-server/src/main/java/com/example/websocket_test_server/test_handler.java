package com.example.websocket_test_server;

import com.example.websocket_test_server.Player;
import com.example.websocket_test_server.Room;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.CloseStatus;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.HashSet;

public class test_handler extends TextWebSocketHandler {
    private final Map<String, Room> rooms; // active game room list
    private final Map<UUID, String> playerUsernames = new ConcurrentHashMap<>(); // map of player UUID to username
    private final Set<String> activeUsernames = new HashSet<>(); // set of active usernames

    public test_handler(Map<String, Room> rooms) {
        this.rooms = new ConcurrentHashMap<>(rooms);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    UUID playerId = UUID.fromString(session.getId());
    String defaultUsername = "Player-" + session.getId().substring(0,8);

    while(activeUsernames.contains(defaultUsername)) {
        defaultUsername = "Player-" + session.getId().substring(0,6) + "-" + (int) (Math.random() * 1000); //
    }

    playerUsernames.put(playerId, defaultUsername);
    activeUsernames.add(defaultUsername);

    sendMessage(session, "USERNAME:" + defaultUsername);
    
    // check for roomID in URL parameters
    String query = session.getUri().getQuery();
    if (query != null && query.contains("room=")) {
        String roomId = query.split("room=")[1].split("&")[0];
        Player player = new Player(playerId, session, defaultUsername);
        Room.assignToRoom(player, rooms, roomId);
    }
}

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        UUID playerId = UUID.fromString(session.getId());
        String[] parts = payload.split(":");
        String command = parts[0];

        switch (command) {
            case "REACT":
            if (parts.length < 3) {
                System.out.println("Invalid REACT format");
                break;
            }
            
            int answer = Integer.parseInt(parts[1]);
            long timestamp = Long.parseLong(parts[2]);
            
            // Find the room containing this player
            Room room = rooms.values().stream()
                .filter(r -> r.containsPlayer(playerId))
                .findFirst()
                .orElse(null);
                
            if (room != null) {
                // Find the actual player instance in the room
                Player player = room.getPlayer1().getId().equals(playerId) 
                    ? room.getPlayer1() 
                    : room.getPlayer2();
                room.recordReaction(player, timestamp, answer);
            }
            break;

            /*case "JOIN":
                Room.assignToRoom(new Player("player-" + session.getId(), session), rooms); // currently set up for quick play
                break;
            */
            case "CREATE_ROOM":
                Player newPlayer = new Player(playerId, session, playerUsernames.get(playerId));
                Room.assignToRoom(newPlayer, rooms, null); //passing null to force new room creation
                break;
            case "LEAVE":
                rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst()
                        .ifPresent(r -> r.removePlayer(playerId));
                break;

            case "DEBUG_LIST_ROOMS":
                rooms.values().stream().forEach(r -> System.out.println(session.getId()));
                break;

                case "JOIN_ROOM":
                if (parts.length < 2) {
                    sendMessage(session, "ERROR:Room ID not provided");
                    break;
                }
                
                String joinRoomID = parts[1];
                Player joiningPlayer = new Player(playerId, session, playerUsernames.get(playerId));
                Room existingRoom = rooms.get(joinRoomID);
                
                if (existingRoom == null) {
                    sendMessage(session, "ERROR:Room not found");
                } else if (existingRoom.containsPlayer(playerId)) {
                    sendMessage(session, "ERROR:Already in this room");
                } else if (existingRoom.getPlayer2() != null) {
                    sendMessage(session, "ERROR:Room is full");
                } else {
                    Room.assignToRoom(joiningPlayer, rooms, joinRoomID);
                }
                break;

            case "REMATCH": // possibly not needed, going back to lobby then restarting game
                rooms.values().stream()
                    .filter(r -> r.containsPlayer(playerId))
                    .findFirst()
                    .ifPresent(r -> {
                        // only allow rematch if both players are present
                        if (r.getPlayer1() != null && r.getPlayer2() != null) {
                            r.resetGame();
                            r.sendMessageToPlayer(r.getPlayer1(), "REMATCH_STARTED");
                            r.sendMessageToPlayer(r.getPlayer2(), "REMATCH_STARTED");
                        }
                    });
                break;

            case "READY_UP":
                rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst()
                        .ifPresent(r -> {
                            System.out.println("Player " + session.getId() + " is in room: " + r.getRoomID());    
                            Player player = new Player(playerId, session, playerUsernames.get(playerId));
                            r.setReady(player);
                        });
                break;

            case "UNREADY":
                rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst()
                        .ifPresent(r -> {
                            System.out.println("Player " + session.getId() + " is in room: " + r.getRoomID());    
                            Player player = new Player(playerId, session, playerUsernames.get(playerId));
                            r.setUnready(player);
                        });
                break;
            
            case "REACT_NOW":
                parts = payload.split(":");
                int reactNowAnswer = Integer.parseInt(parts[1]);
                rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst()
                        .ifPresent(r -> {
                            r.sendReactionInfo(reactNowAnswer, rooms); // adding later
                        });
                break;

            case "SET_USERNAME":
                    if (parts.length < 2) {
                        System.out.println("Invalid SET_USERNAME format");
                        break;
                    }
                    String newUsername = parts[1].trim();
                    if (newUsername.isEmpty()) {
                        System.out.println("Username cannot be empty");
                        break;
                    }
                    if (activeUsernames.contains(newUsername)) {
                        System.out.println("Username already in use");
                        break;
                    }

                    String oldUsername = playerUsernames.get(playerId);
                    if (oldUsername != null) {
                        activeUsernames.remove(oldUsername);
                        playerUsernames.remove(playerId);
                    }
                    activeUsernames.add(newUsername);
                    playerUsernames.put(playerId, newUsername);

                    rooms.values().stream()
                            .filter(r -> r.containsPlayer(playerId))
                            .findFirst()
                            .ifPresent(r -> {
                                Player player = r.getPlayer1().getId().equals(playerId) ? r.getPlayer1() : r.getPlayer2();
                                player.setUsername(newUsername);
                                r.sendMessageToPlayer(r.getPlayer1(), "USERNAME_CHANGED:" + playerId + ":" + newUsername);
                                if (r.getPlayer2() != null) {
                                    r.sendMessageToPlayer(r.getPlayer2(), "USERNAME_CHANGED:" + playerId + ":" + newUsername);
                                }
                            });
                    break;

            /* case "PLAYER_LIST":
                rooms.values().stream()
                        .filter(room -> room.containsPlayer(UUID.fromString(session.getId())))
                        .findFirst()
                        .ifPresent(room -> {
                            System.out.println("Player " + session.getId() + " is in room: " + room.getRoomID());
                        });
                break; */
            default:
                System.out.println("Unknown command: " + command);
                break;
        }
    }

    private void sendMessage(WebSocketSession session, String message) throws Exception {
        session.sendMessage(new TextMessage(message));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    UUID playerId = UUID.fromString(session.getId());
    // remove player from activeUsernames
    String username = playerUsernames.get(playerId);
    if (username != null) {
        activeUsernames.remove(username);
    }
    playerUsernames.remove(playerId);
    
    // removes player from the room when closed
    rooms.values().forEach(room -> room.removePlayer(playerId));
    }

    public void removeRoom(String roomID) {
        rooms.remove(roomID);
    }

}

