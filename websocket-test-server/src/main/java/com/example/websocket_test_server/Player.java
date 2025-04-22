package com.example.websocket_test_server;

import java.util.UUID;

import org.springframework.web.socket.WebSocketSession;

public class Player {
    private final UUID id;
    private final WebSocketSession channel;
    private int score;

    public Player(UUID id, WebSocketSession channel) {
        this.id = id;
        this.channel = channel;
        this.score = 0;
    }

    // get the stuff
    public UUID getId() { return id; }
    public WebSocketSession getChannel() { return channel; }
    public int getScore() { return score; }

    // score just for testing
    public Player withAddedScore(int points) {
        Player newPlayer = new Player(this.id, this.channel);
        newPlayer.score = this.score + points;
        return newPlayer;
    }
}
