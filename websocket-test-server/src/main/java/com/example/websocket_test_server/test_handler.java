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
import java.io.IOException;
import java.util.Optional;

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
                try {
                    Player hostPlayer = new Player(playerId, session, playerUsernames.get(playerId));
                    Room newRoom = new Room(hostPlayer);
                    rooms.put(newRoom.getRoomID(), newRoom);
                    
                    // Send response in a synchronized block
                    synchronized (session) {
                        if (session.isOpen()) {
                            session.sendMessage(new TextMessage("ROOM_CREATED:" + newRoom.getRoomID()));
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error creating room: " + e.getMessage());
                    try {
                        session.sendMessage(new TextMessage("ERROR:Failed to create room: " + e.getMessage()));
                    } catch (IOException ioException) {
                        System.err.println("Failed to send error message: " + ioException.getMessage());
                    }
                }
                break;
                
            case "LEAVE":
                rooms.values().stream()
                    .filter(r -> r.containsPlayer(playerId))
                    .findFirst()
                    .ifPresent(r -> {
                        // Notify other player before removing
                        Player remainingPlayer = r.getPlayer1().getId().equals(playerId) ? 
                            r.getPlayer2() : r.getPlayer1();
                        
                        if (remainingPlayer != null) {
                            try {
                                remainingPlayer.getChannel().sendMessage(
                                    new TextMessage("HOST_DISCONNECTED")
                                );
                            } catch (IOException e) {
                                System.out.println("Error sending disconnect message");
                            }
                        }
                        
                        r.removePlayer(playerId);
                        
                        // Remove room if empty
                        if (r.getPlayer1() == null && r.getPlayer2() == null) {
                            rooms.remove(r.getRoomID());
                        }
                    });
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
                    
                    // Notify both players about the new connection
                    Player player1 = existingRoom.getPlayer1();
                    Player player2 = existingRoom.getPlayer2();
                    
                    if (player1 != null && player2 != null) {
                        sendMessage(player1.getChannel(), "PLAYER_JOINED");
                        sendOpponentInfo(player1.getChannel(), player2);
                        sendOpponentInfo(player2.getChannel(), player1);
                    }
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

                case "GET_DEFAULT_USERNAME":
                String currentUsername = playerUsernames.get(playerId);
            
                // Generate a new default username if needed
                if (currentUsername == null || currentUsername.startsWith("Player-")) {
                    final String defaultUsername = "Player-" + session.getId().substring(0,8);
            
                    // Ensure username is unique
                    String tempUsername = defaultUsername;
                    while(activeUsernames.contains(tempUsername)) {
                        tempUsername = "Player-" + session.getId().substring(0,6) + "-" + (int)(Math.random() * 1000);
                    }
            
                    // Update maps
                    if (currentUsername != null) {
                        activeUsernames.remove(currentUsername);
                    }
                    playerUsernames.put(playerId, tempUsername);
                    activeUsernames.add(tempUsername);
            
                    // Update player in room if they're in one
                    rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst()
                        .ifPresent(r -> {
                            Player player = r.getPlayer1().getId().equals(playerId) ? r.getPlayer1() : r.getPlayer2();
                            player.setUsername(defaultUsername);
                            r.broadcastUsernameChange(playerId, defaultUsername);
                        });

                    // Send response
                    session.sendMessage(new TextMessage("DEFAULT_USERNAME_SET:" + defaultUsername));
                } else {
                    // If they already have a non-default username, just return it
                    session.sendMessage(new TextMessage("DEFAULT_USERNAME_SET:" + currentUsername));
                }
            break;

            case "SET_USERNAME":
                    if (parts.length < 2) {
                        System.out.println("Invalid SET_USERNAME format");
                        System.out.println("Received: " + payload);
                        break;
                    }
                    String newUsername = parts[1].trim();
                    if (newUsername.isEmpty()) {
                        System.out.println("Username cannot be empty");
                        break;
                    }
                    if (activeUsernames.contains(newUsername)) {
                        //System.out.println("Username already in use");
                        session.sendMessage(new TextMessage("INVALID_USER"));
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

            case "GET_PLAYER_INFO":
            System.out.println("Received GET_PLAYER_INFO");   
                String username = playerUsernames.get(UUID.fromString(session.getId()));
                int wins = new Player(UUID.fromString(session.getId()), null, username).getWins().size();
                int losses = new Player(UUID.fromString(session.getId()), null, username).getLosses().size();
                try {
                    session.sendMessage(new TextMessage("PLAYER_INFO:" + username + ":" + wins + ":" + losses));
                    //System.out.println("Sent PLAYER_INFO:" + username + ":" + wins + ":" + losses);
                } catch (IOException e) {
                    System.out.println("Error sending message: " + e.getMessage());
                }
                break;

                case "GET_OPPONENT_INFO":
                Optional<Room> roomOptional = rooms.values().stream()
                        .filter(r -> r.containsPlayer(playerId))
                        .findFirst();
                
                if (roomOptional.isPresent()) {
                    room = roomOptional.get();
                    Player opponent = room.getPlayer1().getId().equals(playerId) ? 
                            room.getPlayer2() : room.getPlayer1();
                    
                    if (opponent != null) {
                        String opponentUsername = opponent.getUsername();
                        int opponentWins = opponent.getWins().size();
                        int opponentLosses = opponent.getLosses().size();
                        sendMessage(session, "OPPONENT_INFO:" + opponentUsername + ":" + opponentWins + ":" + opponentLosses);
                        //System.out.println("Sent OPPONENT_INFO:" + opponentUsername + ":" + opponentWins + ":" + opponentLosses);
                    } else {
                        sendMessage(session, "OPPONENT_INFO:null:0:0");
                    }
                } else {
                    sendMessage(session, "ERROR:Player not in any room");
                }
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


    private synchronized void sendMessage(WebSocketSession session, String message) {
        if (session != null && session.isOpen()) {
            try {
                synchronized (session) {
                    session.sendMessage(new TextMessage(message));
                }
            } catch (IOException e) {
                System.out.println("Failed to send message: " + e.getMessage());
            }
    
        }
    }

    private void sendOpponentInfo(WebSocketSession session, Player opponent) throws IOException {
        if (opponent != null) {
            String opponentUsername = opponent.getUsername();
            int opponentWins = opponent.getWins().size();
            int opponentLosses = opponent.getLosses().size();
            session.sendMessage(new TextMessage(
                "OPPONENT_INFO:" + opponentUsername + ":" + opponentWins + ":" + opponentLosses
            ));
        } else {
            session.sendMessage(new TextMessage("OPPONENT_INFO:null:0:0"));
        }
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

