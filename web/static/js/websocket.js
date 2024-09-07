// websocket.js
import { showChat, hideChat, clearTypewriterEffect } from './ui.js';

let conn;
let selectedChat = "General";

class Event {
    constructor(type, payload) {
        this.type = type;
        this.payload = payload;
    }
}

class SendMessageEvent {
    constructor(message, from, sent) {
        this.message = message;
        this.from = from;
        this.sent = sent;
    }
}

class NewMessageEvent {
    constructor(message, from) {
        this.message = message;
        this.from = from;
    }
}

class ChangeChatRoomEvent {
    constructor(room) {
        this.room = room;
    }
}

function connectWebSocket(otp) {
    if (window["WebSocket"]) {
        console.log("Connecting to WebSocket...");

        conn = new WebSocket(`wss://${window.location.host}/ws?otp=${otp}`);

        conn.onopen = function (evt) {
            console.log("Connection established.");
            showChat();
        }

        conn.onclose = function (evt) {
            console.log("Connection closed.");
            hideChat();
        }

        conn.onmessage = function (evt) {
            const data = JSON.parse(evt.data);
            const event = Object.assign(new Event(), data);
            routeEvent(event);
        }
    } else {
        alert("Your browser does not support WebSockets.");
        return;
    }
}

function changeChatRoom() {
    let newchat = document.getElementById("chatroom");
    if (newchat && newchat.value !== selectedChat) {
        selectedChat = newchat.value;
        
        let changeEvent = new ChangeChatRoomEvent(selectedChat);
        sendEvent("change-chatroom", changeEvent);
        document.getElementById("chat-header").textContent = `Currently in chat: ${selectedChat}`;
        document.title = `Chaty: ${selectedChat}`;
        document.getElementById("chatmessage").value = "";
        console.log(`Chat room changed to: ${selectedChat}`);
    }
    return false;
}

function sendMessage(event) {
    event.preventDefault();
    let message = document.getElementById("message");
    if (message && message.value.trim()) {
        let outgoingEvent = new SendMessageEvent(message.value, "admin", new Date().toISOString());
        sendEvent("send-message", outgoingEvent);
        message.value = "";
    }
}

function sendEvent(eventname, payload) {
    const event = new Event(eventname, payload);
    conn.send(JSON.stringify(event));
}

function routeEvent(event) {
    if (event.type === undefined) {
        alert("Event type is required.");
    }

    switch(event.type) {
        case "new-message":
            const messageEvent = Object.assign(new NewMessageEvent(), event.payload);
            chatMessageUpdate(`${messageEvent.from}: ${messageEvent.message}`);
            break;
        default:
            alert("Event type not recognized.");
    }
}

function chatMessageUpdate(message) {
    const chat = document.getElementById("chatmessage");
    
    // Clear typewriter effect and chat area before adding new messages
    clearTypewriterEffect();
    if (chat.value.includes("Welcome to Chaty")) {
        chat.value = '';
    }
    
    chat.value += `${message}\n`;
    chat.scrollTop = chat.scrollHeight;
}

export { connectWebSocket, changeChatRoom, sendMessage };