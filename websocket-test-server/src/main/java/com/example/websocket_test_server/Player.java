package com.example.websocket_test_server;

import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.socket.WebSocketSession;

public class Player {
    private final UUID id;
    private final WebSocketSession channel;
    private int lives;
    private String username;
    private final List<Long> reactionTimes = new ArrayList<>();
    private final List<Integer> wins = new ArrayList<>();
    private final List<Integer> losses = new ArrayList<>(); 

    public Player(UUID id, WebSocketSession channel, String username) {
        this.id = id;
        this.channel = channel;
        this.lives = 3; // default 3 lives
        this.username = username;
        this.reactionTimes.clear();
        this.wins.clear();
        this.losses.clear();
    }

    // get the stuff
    public UUID getId() { return id; }
    public WebSocketSession getChannel() { return channel; }
    public int getLives() { return lives; }
    public List<Long> getReactionTimes() { return reactionTimes; }
    public List<Integer> getWins() { return wins; }
    public List<Integer> getLosses() { return losses; }
    public String getUsername() { return username; }

    // remove a life
    public void removeLife() { 
        this.lives = Math.max(0, this.lives - 1);
     }

    public void addWin() { wins.add(1); }
    public void addLoss() { losses.add(1); }    
    public void setLives(int lives) { this.lives = lives; }
    public void setUsername(String username) { this.username = username; }
}
