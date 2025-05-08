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
    private boolean reactionLocked = false; 

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
            // If host is leaving, notify player2
            if (player2 != null) {
                sendMessageToPlayer(player2, "HOST_DISCONNECTED");
            }
            player1 = null;
        } else if (player2 != null && player2.getId().equals(playerId)) {
            // If guest is leaving, notify player1
            if (player1 != null) {
                sendMessageToPlayer(player1, "PLAYER_DISCONNECTED");
            }
            player2 = null;
        }
    }

    public static void assignToRoom(Player player, Map<String, Room> rooms, String roomID) {
        if (roomID != null && !roomID.isEmpty()) {
            Room selectedRoom = rooms.get(roomID);
            if (selectedRoom != null && selectedRoom.player2 == null && 
                !selectedRoom.player1.getId().equals(player.getId())) {
                
                selectedRoom.player2 = player;
                
                // Notify both players immediately
                selectedRoom.sendMessageToPlayer(selectedRoom.player1, 
                    "OPPONENT_JOINED:" + player.getUsername());
                selectedRoom.sendMessageToPlayer(player, 
                    "OPPONENT_JOINED:" + selectedRoom.player1.getUsername());
                
                // Send full player info
                selectedRoom.sendPlayerInfo(selectedRoom.player1);
                selectedRoom.sendPlayerInfo(player);
                return;
            } 
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

    public void broadcastUsernameChange(UUID playerId, String newUsername) {
        sendMessageToPlayer(player1, "USERNAME_CHANGED:" + playerId + ":" + newUsername);
        if (player2 != null) {
            sendMessageToPlayer(player2, "USERNAME_CHANGED:" + playerId + ":" + newUsername);
        }
    }

    private void sendPlayerInfo(Player player) {
        Player opponent = player.getId().equals(player1.getId()) ? player2 : player1;
        
        // Send player their own info
        String playerInfo = String.format("PLAYER_INFO:%s:%d:%d",
            player.getUsername(),
            player.getWins().size(),
            player.getLosses().size());
        sendMessageToPlayer(player, playerInfo);
        
        // Send opponent info if available
        if (opponent != null) {
            String opponentInfo = String.format("OPPONENT_INFO:%s:%d:%d",
                opponent.getUsername(),
                opponent.getWins().size(),
                opponent.getLosses().size());
            sendMessageToPlayer(player, opponentInfo);
        } else {
            sendMessageToPlayer(player, "OPPONENT_INFO:null:0:0");
        }
    }

    public void sendReactionInfo(int answer, Map<String, Room> rooms) {
        if (gameOver || player1 == null || player2 == null) {
            System.out.println("Cannot get reaction info - game state invalid");
            return;
        }

        // unlock reactions and set new start time
        unlockReactions();
        this.startTime = System.currentTimeMillis();
        this.answer = answer;

        // notify players with server timestamp
        String reactNowMessage = String.format("REACT_NOW:%d:%d", this.answer, this.startTime);
        sendMessageToPlayer(player1, reactNowMessage);
        sendMessageToPlayer(player2, reactNowMessage);
        
        rooms.put(roomID, this);
    }

    public void recordReaction(Player reactingPlayer, long reactionTime, int playerAnswer) {
        if (gameOver || player1 == null || player2 == null) {
            System.out.println("Cannot record reaction - invalid game state");
            return;
        }

        reactionLocked = true; // lock reaction after first reaction (should stop spamming)

        // validate reaction timing
        long serverTime = System.currentTimeMillis();
        long reactionLatency = serverTime - startTime;
        if (reactionLatency < 0) {
            System.out.println("Invalid reaction - too early");
            return;
        }

        String latencyMessage = String.format("LATENCY:%s:%d", 
        reactingPlayer.getUsername(), reactionLatency);
        sendMessageToPlayer(player1, latencyMessage);
        sendMessageToPlayer(player2, latencyMessage);

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

    public synchronized void sendMessageToPlayer(Player player, String message) {
        if (player != null && player.getChannel() != null && player.getChannel().isOpen()) {
            try {
                synchronized (player.getChannel()) {
                    player.getChannel().sendMessage(new TextMessage(message));
                }
            } catch (IOException e) {
                System.out.println("Failed to send message to player " + player.getId() + ": " + e.getMessage());
                // Remove player if connection is broken
                removePlayer(player.getId());
            }
        }
    }

    public void resetGame() {
        gameOver = false;   
        player1Ready = false;
        player2Ready = false;
        unlockReactions();
    }

    public void unlockReactions() {
        this.reactionLocked = false;
    }


    public void endGame() {
        gameOver = true;
        if (reactionTimer != null) {
            reactionTimer.cancel();
            reactionTimer = null;
        }

        // determine winner based on remaining lives and add win (because how did i forget to do this)
        if (player1.getLives() > player2.getLives()) {
            player1.addWin();
            player2.addLoss();
        } else if (player2.getLives() > player1.getLives()) {
            player2.addWin();
            player1.addLoss();
        }
        
        // send final results
        String results = String.format("FINAL_RESULTS:%s:%d:%s:%d",
                player1.getUsername(), player1.getWins().size(),
                player2.getUsername(), player2.getWins().size());
        
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
