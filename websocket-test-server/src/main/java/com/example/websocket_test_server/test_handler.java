package com.example.websocket_test_server;

import com.example.websocket_test_server.Player;
import com.example.websocket_test_server.Room;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.io.IOException;

public class test_handler extends TextWebSocketHandler {
    private final Map<String, Room> rooms; // active game room list

    public test_handler(Map<String, Room> rooms) {
        this.rooms = rooms;
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
                long reactionTime = Long.parseLong(parts[1]);
                rooms.values().stream()
                        .filter(room -> room.containsPlayer(session.getId()))
                        .findFirst()
                        .ifPresent(room -> {
                            long currentTime = System.currentTimeMillis();
                            if (currentTime >= room.getStartTime()) {
                                room.recordReaction(new Player("player-" + session.getId(), session), reactionTime, rooms);
                            } else {
                                System.out.println("Invalid REACT: No REACT_NOW message sent");
                            }
                        });
                break;

            case "JOIN":
                Room.assignToRoom(new Player("player-" + session.getId(), session), rooms);
                break;

            case "LEAVE":
                rooms.values().stream()
                        .filter(room -> room.containsPlayer(session.getId()))
                        .findFirst()
                        .ifPresent(room -> room.removePlayer(session.getId()));
                break;

            case "DEBUG_LIST_ROOMS":
                rooms.values().stream().forEach(room -> System.out.println(session.getId()));
                break;

            default:
                System.out.println("Unknown command: " + command);
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        // removes player from the room when closed
        rooms.values()
                .forEach(room -> room.removePlayer(session.getId()));
    }

    public void removeRoom(String roomID) {
        rooms.remove(roomID);
    }

}