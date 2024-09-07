// login.js
import { connectWebSocket } from './websocket.js';

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    let formData = {
        username: username,
        password: password
    };

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        mode: 'cors'
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed.');
        }
    }).then((data) => {
        connectWebSocket(data.otp);
    }).catch((error) => {
        alert(error);
    });

    return false;
}

export { login };