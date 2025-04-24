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
    private int answer; // correct answer

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
                selectedRoom.notifyPlayerJoined(player);
                //selectedRoom.startGame(); // shouldn't automatically start anymore
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

    /* 
    public void startGame() {
        // notifying both players
        if (player1 != null && player2 != null) {
            sendMessageToPlayer(player1, "GAME_START:" + roomID);
            sendMessageToPlayer(player2, "GAME_START:" + roomID);
            startRound();
        }
    }
    */ // removed

    // schedules reaction signal between 1-3 seconds
    private Timer reactionTimer;

    /*
    public void startRound() {
        if (gameOver) {
            System.out.println("Cannot start round - game over");
            return;
        }
        resetGame();
        this.startTime = System.currentTimeMillis() + 1000 + (long) (Math.random() * 2000);
        if (reactionTimer != null) {
            reactionTimer.cancel();
        }
        // reactionTimer = new Timer();
        reactionTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                sendMessageToPlayer(player1, "REACT_NOW:" + roomID);
                sendMessageToPlayer(player2, "REACT_NOW:" + roomID);
            }
        }, startTime - System.currentTimeMillis());
    }
    */ // deprecated

    public void sendReactionInfo(long timestamp, int answer, Map<String, Room> rooms) {
        if (gameOver || player1 == null || player2 == null) {
            System.out.println("Cannot get reaction info - game state invalid");
            return;
        }
    
        // verify player is in room
        if (!containsPlayer(player1.getId()) || !containsPlayer(player2.getId())) {
            System.out.println("Player not in room");
            return;
        }
    
        if (timestamp < startTime) {
            System.out.println("Invalid reaction - too early");
            return;
        }
          
        // save reaction info
        this.startTime = timestamp;
        this.answer = answer;
        rooms.put(roomID, this);
    }

    public void recordReaction(Player reactingPlayer, long reactionTime, int playerAnswer) {
        if (gameOver || player1 == null || player2 == null) {
            System.out.println("Cannot record reaction - invalid game state");
            return;
        }

        // validate reaction timing
        long reactionLatency = reactionTime - startTime;
        if (reactionLatency < 0) {
            System.out.println("Invalid reaction - too early");
            return;
        }

        // determine if answer is correct (after speed check)
        boolean isCorrect = (playerAnswer == this.answer);
        
        // find the opponent
        Player opponent = reactingPlayer.getId().equals(player1.getId()) ? player2 : player1;
        
        // process results
        if (!isCorrect) {
            reactingPlayer.removeLife();
            System.out.println(reactingPlayer.getId() + " answered incorrectly");
        } else if (reactionLatency > 2000) { // 2 second cutoff
            reactingPlayer.removeLife();
            System.out.println(reactingPlayer.getId() + " reacted too slowly");
        }

        if(isCorrect) {
            System.out.println(reactingPlayer.getId() + " answered correctly");
            opponent.removeLife();
        }

        // Send life updates to both players
        sendLifeUpdates();
        
        // Check game over condition
        if (player1.getLives() <= 0 || player2.getLives() <= 0) {
            endGame();
        }
    }

    private void sendLifeUpdates() {
        String livesUpdate = String.format("LIVES:%s: %s: %d: %s: %s: %d",
            player1.getId(), player1.getUsername(), player1.getLives(),
            player2.getId(), player2.getUsername(),player2.getLives());
        sendMessageToPlayer(player1, livesUpdate);
        sendMessageToPlayer(player2, livesUpdate);
    }

    
    boolean player1Ready = false, player2Ready = false, gameOver = false;
    
    public void setReady(Player player) {
        if (player.getId().equals(player1.getId())) {
            player1Ready = true;
        } else if (player.getId().equals(player2.getId())) {
            player2Ready = true;
        }
    
        if (player1Ready && player2Ready && !gameOver) {
            // reset lives only when starting new game
            if (player1 != null) player1.setLives(3);
            if (player2 != null) player2.setLives(3);
            
            sendMessageToPlayer(player1, "GAME_START:" + roomID);
            sendMessageToPlayer(player2, "GAME_START:" + roomID);
            //startRound();
        }
    }

    
    public void setUnready(Player player) {
        if (player.getId().equals(player1.getId())) {
            player1Ready = false;
        } else if (player.getId().equals(player2.getId())) {
            player2Ready = false;
        }
    }

    public void notifyPlayerJoined(Player player) {
        if (player1 != null && player2 != null) {
            String player1Info = "PLAYER_JOINED:" + player2.getUsername();
            String player2Info = "PLAYER_JOINED:" + player1.getUsername();
            sendMessageToPlayer(player1, player1Info);
            sendMessageToPlayer(player2, player2Info);

            String roomInfo = String.format("ROOM_INFO:%s: %s: %d, %s: %d", 
             roomID,
             player1.getUsername(), player1.getLives(),
             player2.getUsername(), player2.getLives());
            
            sendMessageToPlayer(player, roomInfo);
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
    }

    public void resetGame() {
        gameOver = false;   
        player1Ready = false;
        player2Ready = false;
    }


    public void endGame() {
        gameOver = true;
        if (reactionTimer != null) {
            reactionTimer.cancel();
            reactionTimer = null;
        }
        
        // send final results
        String results = String.format("FINAL_RESULTS:%s:%d:%s:%d",
                player1.getId(), player1.getWins().size(),
                player2.getId(), player2.getWins().size());
        
        if (player1 != null) {
            sendMessageToPlayer(player1, results);
            sendMessageToPlayer(player1, "GAME_OVER");
        }
        if (player2 != null) {
            sendMessageToPlayer(player2, results);
            sendMessageToPlayer(player2, "GAME_OVER");
        }
        
        // Reset ready states
        player1Ready = false;
        player2Ready = false;
    }
}
