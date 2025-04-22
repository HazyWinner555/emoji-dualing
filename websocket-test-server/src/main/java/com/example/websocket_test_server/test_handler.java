package com.example.websocket_test_server;

import com.example.websocket_test_server.Player;
import com.example.websocket_test_server.Room;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class test_handler extends TextWebSocketHandler {
    private final Map<String, Room> rooms; // active game room list

    public test_handler(Map<String, Room> rooms) {
        this.rooms = new ConcurrentHashMap<>(rooms);
    }

    /* @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // create new player then assign to room
        Player player = new Player("player-" + session.getId(), session);
        Room.assignToRoom(player, rooms);
    }
    */

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        String[] parts = payload.split(":");
        String command = parts[0];

        switch (command) {
            case "REACT":
    System.out.println("Received REACT from " + session.getId());
    UUID sessionId = UUID.fromString(session.getId());
    
    rooms.values().stream()
        .filter(room -> {
            boolean contains = room.containsPlayer(sessionId);
            System.out.println("Checking room " + room.getRoomID() + ": " + contains);
            return contains;
        })
        .findFirst()
        .ifPresent(room -> {
            System.out.println("Found room for player " + sessionId);
            long currentTime = System.currentTimeMillis();
            System.out.println("Current time: " + currentTime + 
                            ", Start time: " + room.getStartTime());
            
            if (room.getStartTime() > 0 && currentTime >= room.getStartTime()) {
                System.out.println("Recording valid reaction");
                // find the existing player instead of creating new one
                Player reactingPlayer = null;
                if (room.getPlayer1() != null && room.getPlayer1().getId().equals(sessionId)) {
                    reactingPlayer = room.getPlayer1();
                } else if (room.getPlayer2() != null && room.getPlayer2().getId().equals(sessionId)) {
                    reactingPlayer = room.getPlayer2();
                }
                
                if (reactingPlayer != null) {
                    room.recordReaction(reactingPlayer, currentTime, rooms);
                } else {
                    System.out.println("Player not found in room");
                }
            } else {
                System.out.println("Invalid REACT: No REACT_NOW message sent or too early");
            }
        });
    break;

            /*case "JOIN":
                Room.assignToRoom(new Player("player-" + session.getId(), session), rooms); // currently set up for quick play
                break;
            */
            case "CREATE_ROOM":
                Player newPlayer = new Player(UUID.fromString(session.getId()), session);
                Room.assignToRoom(newPlayer, rooms, null); //passing null to force new room creation
                break;
            case "LEAVE":
                rooms.values().stream()
                        .filter(room -> room.containsPlayer(UUID.fromString(session.getId())))
                        .findFirst()
                        .ifPresent(room -> room.removePlayer(UUID.fromString(session.getId())));
                break;

            case "DEBUG_LIST_ROOMS":
                rooms.values().stream().forEach(room -> System.out.println(session.getId()));
                break;

            case "JOIN_ROOM":
                String roomID = parts[1];
                Player joiningPlayer = new Player(UUID.fromString(session.getId()), session);
                Room.assignToRoom(joiningPlayer, rooms, roomID); //passing specific roomID to join
                break;

            case "PLAYER_LIST":
                rooms.values().stream()
                        .filter(room -> room.containsPlayer(UUID.fromString(session.getId())))
                        .findFirst()
                        .ifPresent(room -> {
                            System.out.println("Player " + session.getId() + " is in room: " + room.getRoomID());
                        });

            default:
                System.out.println("Unknown command: " + command);
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
    // removes player from the room when closed
    rooms.values().forEach(room -> room.removePlayer(UUID.fromString(session.getId())));
}

    public void removeRoom(String roomID) {
        rooms.remove(roomID);
    }

}
