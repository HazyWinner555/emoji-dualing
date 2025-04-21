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

        // handling reaction time messages
        if(payload.startsWith("REACT")) {
            long reactionTime = Long.parseLong(payload.split(":")[1]);

            //find room containing player and record reaction
            rooms.values().stream()
                    .filter(room -> room.containsPlayer(session.getId()))
                    .findFirst()
                    .ifPresent(room -> room.recordReaction(new Player("player-" + session.getId(), session), reactionTime, rooms));
        }

        if (payload.startsWith("JOIN")) {
            // find room and assign player to room
            Room.assignToRoom(new Player("player-" + session.getId(), session), rooms);
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