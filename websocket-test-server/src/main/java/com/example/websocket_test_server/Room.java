package com.example.websocket_test_server;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.util.Map;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;

public class Room {
    private final String roomID;
    private Player player1;
    private Player player2;
    private long startTime; // timestamp when the reaction signal will be sent

    public Room(Player p1) {
        Random rand = new Random();
        String charx = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder id = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            id.append(charx.charAt(rand.nextInt(charx.length())));
        }
        this.roomID = id.toString();
        this.player1 = p1;
        this.player2 = null;
    }

    // checks if current room has a player
    // sessionID - websocket sessionID check
    // expected to return true if player is in room
    public boolean containsPlayer(UUID playerId) {
        return (player1 != null && player1.getId().equals(playerId)) || (player2 != null && player2.getId().equals(playerId));
    }

    // should remove player if they disconnect
    public void removePlayer(UUID playerId) {
        if (player1 != null && player1.getId().equals(playerId)) {
            player1 = null;
        } else if (player2 != null && player2.getId().equals(playerId)) {
            player2 = null;
        }
    }

    public static void assignToRoom(Player player, Map<String, Room> rooms, String roomID) {
        // if joining an existing room
        if (roomID != null && !roomID.isEmpty()) {
            Room selectedRoom = rooms.get(roomID);
            if (selectedRoom != null && selectedRoom.player2 == null && 
                !selectedRoom.player1.getId().equals(player.getId())) {
                selectedRoom.player2 = player;
                selectedRoom.startGame();
                return;
            }
        }
        
        // otherwise create new room
        Room newRoom = new Room(player);
        rooms.put(newRoom.roomID, newRoom);
        newRoom.sendMessageToPlayer(player, "ROOM_CREATED:" + newRoom.roomID);
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

    public String getRoomID() {
        return roomID;
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
    private Timer reactionTimer;

    public void startRound() {
        this.startTime = System.currentTimeMillis() + 1000 + (long) (Math.random() * 2000);
        if (reactionTimer != null) {
            reactionTimer.cancel();
        }
        reactionTimer = new Timer();
        reactionTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                sendMessageToPlayer(player1, "REACT_NOW:" + roomID);
                sendMessageToPlayer(player2, "REACT_NOW:" + roomID);
            }
        }, startTime - System.currentTimeMillis());
    }

    public void recordReaction(Player player, long reactionTime, Map<String, Room> rooms) {
        if (player1 == null || player2 == null) {
            System.out.println("Cannot record reaction - missing players");
            return;
        }
    
        // verify the player is actually in this room
        if (!containsPlayer(player.getId())) {
            System.out.println("Player " + player.getId() + " not in this room");
            return;
        }
    
        System.out.println("Recording reaction for player " + player.getId() + 
                          " at time " + reactionTime + 
                          " (startTime was " + startTime + ")");
    
        long latency = reactionTime - startTime;
        System.out.println("Calculated latency: " + latency + "ms");
    
        if (latency < 0) {
            System.out.println("Invalid reaction - too early");
            return;
        }
    
        int points = (int) Math.max(0, 1000 - latency);
        System.out.println("Awarding points: " + points);
    
        // Update scores
        if (player.getId().equals(player1.getId())) {
            player1 = player1.withAddedScore(points);
        } else if (player.getId().equals(player2.getId())) {
            player2 = player2.withAddedScore(points);
        }
    
        // send updated scores
        String scores = String.format("SCORES:%s:%d:%s:%d",
                player1.getId(), player1.getScore(),
                player2.getId(), player2.getScore());
        
        System.out.println("Sending scores: " + scores);
        sendMessageToPlayer(player1, scores);
        sendMessageToPlayer(player2, scores);
    
        // start next round if both players still present
        if (player1 != null && player2 != null) {
            System.out.println("Starting new round...");
            startRound();
        } else {
            System.out.println("Ending game - player left");
            endGame();
            Room.removeRoom(roomID, rooms);
        }
    }

    public void sendMessageToPlayer(Player player, String message) {
        if (player != null && player.getChannel().isOpen()) {
            try {
                player.getChannel().sendMessage(new TextMessage(message));
            } catch (IOException e) {
                System.out.println("server blocked your message smh, player id: " + player.getId());
            }
        }
        if (message.equals("REACT")) {
            sendMessageToPlayer(player, "REACTION_ACK");
        }
    }


    public void endGame() {
        if (reactionTimer != null) {
            reactionTimer.cancel();
            reactionTimer = null;
        }
        if (player1 != null && player2 != null) {
            sendMessageToPlayer(player1, "GAME_END:" + roomID);
            sendMessageToPlayer(player2, "GAME_END:" + roomID);
        } else if (player1 != null) {
            sendMessageToPlayer(player1, "GAME_END:" + roomID);
        } else if (player2 != null) {
            sendMessageToPlayer(player2, "GAME_END:" + roomID);
        }
    }
}
