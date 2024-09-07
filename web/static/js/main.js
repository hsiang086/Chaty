// main.js
import { setTheme, toggleTheme } from './theme.js';
import { login } from './login.js';
import { changeChatRoom, sendMessage } from './websocket.js';
import { addRippleEffect, typeWriterEffect } from './ui.js';

document.addEventListener('DOMContentLoaded', (event) => {
    const loginThemeToggle = document.getElementById('login-theme-toggle');
    const chatThemeToggle = document.getElementById('chat-theme-toggle');

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Add click event listeners to both theme toggle buttons
    [loginThemeToggle, chatThemeToggle].forEach(toggle => {
        toggle.addEventListener('click', toggleTheme);
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.neon-button').forEach(addRippleEffect);

    // Set up event listeners
    document.getElementById("chatroom-selection").onsubmit = changeChatRoom;
    document.getElementById("chatroom-message").onsubmit = sendMessage;
    document.getElementById("login-form").onsubmit = login;
});