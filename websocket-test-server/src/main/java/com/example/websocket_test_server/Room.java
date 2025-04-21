package com.example.websocket_test_server;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.Map;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

public class Room {
    private final String roomID;
    private Player player1;
    private Player player2;
    private long startTime; // timestamp when the reaction signal will be sent

    public Room(Player p1) {
        Random rand = new Random();
        String charx = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder id = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            id.append(charx.charAt(rand.nextInt(charx.length())));
        }
        this.roomID = id.toString();
        this.player1 = p1;
        this.player2 = null;
    }

    // checks if current room has a player
    // sessionID - websocket sessionID check
    // expected to return true if player is in room
    public boolean containsPlayer(String sessionID) {
        return (player1 != null && player1.getId().equals("player-" + sessionID)) || (player2 != null && player2.getId().equals("player-" + sessionID));
    }

    // should remove player if they disconnect
    public void removePlayer(String sessionID) {
        if (player1 != null && player1.getId().equals("player-" + sessionID)) {
            player1 = null;
        } else if (player2 != null && player2.getId().equals("player-" + sessionID)) {
            player2 = null;
        }
    }

    public static void assignToRoom(Player player, Map<String, Room> rooms) {
        // find room a room with 1 player first
        Room availibleRoom = rooms.values()
                .stream()
                .filter(room -> room.player2 == null && !room.player1.getId().equals(player.getId())) // now makes sure you can't join your own room
                .findFirst()
                .orElse(null);

        if (availibleRoom != null) {
            availibleRoom.player2 = player;
            rooms.put(availibleRoom.roomID, availibleRoom);
            availibleRoom.startGame();
        }
        else {
            // create new room if no availible rooms
            Room newRoom = new Room(player);
            rooms.put(newRoom.roomID, newRoom);
        }
    }

    public static void removeRoom(String roomID, Map<String, Room> rooms) {
        rooms.remove(roomID);
    }   

    public Player getPlayer1() {
        return player1;
    }

    public Player getPlayer2() {
        return player2;
    }

    public long getStartTime() {
        return startTime;
    }

    public void setPlayer2(Player player2) {
        this.player2 = player2;
    }

    public void startGame() {
        // notifying both players
        if (player1 != null && player2 != null) {
            sendMessageToPlayer(player1, "GAME_START:" + roomID);
            sendMessageToPlayer(player2, "GAME_START:" + roomID);
            startRound();
        }
    }

    // schedules reaction signal between 1-3 seconds
    public void startRound() {
        this.startTime = System.currentTimeMillis() + 1000 + (long) (Math.random() * 2000);
        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                sendMessageToPlayer(player1, "REACT_NOW:" + roomID);
                sendMessageToPlayer(player2, "REACT_NOW:" + roomID);
            }
        }, startTime - System.currentTimeMillis());
    }

    public void recordReaction(Player player, long reactionTime, Map<String, Room> rooms) {
        if (player1 == null || player2 == null) return;

        long latency = reactionTime - startTime;
        int points = (int) Math.max(0, 1000 - latency);

        if (player.getId().equals(player1.getId())) {
            player1 = player1.withAddedScore(points);
        } else if (player.getId().equals(player2.getId())) {
            player2 = player2.withAddedScore(points);
        }

        String scores = String.format("SCORES:%s:%d:%s:%d",
                player1.getId(), player1.getScore(),
                player2.getId(), player2.getScore());

        sendMessageToPlayer(player1, scores);
        sendMessageToPlayer(player2, scores);

        // sending both players the score (changing to lives system later)
        if (player1 != null && player2 != null) {
            startRound();
        } else {
            // Clean up room if a player left
            endGame();
            Room.removeRoom(roomID, rooms);
        }
    }

    private void sendMessageToPlayer(Player player, String message) {
        if (player != null && player.getChannel().isOpen()) {
            try {
                player.getChannel().sendMessage(new TextMessage(message));
            } catch (IOException e) {
                System.out.println("server blocked your message smh, player id: " + player.getId());
            }
        }
    }

    public void endGame() {
        if (player1 != null && player2 != null) {
            sendMessageToPlayer(player1, "GAME_END:" + roomID);
            sendMessageToPlayer(player2, "GAME_END:" + roomID);
        }
        else if (player1.getId().equals(player2.getId())) {
            sendMessageToPlayer(player1, "GAME_END:" + roomID);
        }
    }
}
