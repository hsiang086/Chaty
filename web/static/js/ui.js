// ui.js
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");

function showChat() {
    loginContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    setTimeout(() => {
        chatContainer.classList.add('faded-in', 'scaled');
    }, 100);
    // Add typing effect to the welcome message
    const welcomeMessage = "Welcome to Chaty, the next-gen chat experience! Start typing to begin your journey...";
    const chatMessage = document.getElementById('chatmessage');
    typeWriterEffect(chatMessage, welcomeMessage, () => {
        // This callback will be called when the typewriter effect is complete
        console.log("Typewriter effect completed");
    });
}

function hideChat() {
    chatContainer.classList.remove('faded-in', 'scaled');
    setTimeout(() => {
        chatContainer.classList.add('hidden');
    }, 500);
}

function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        
        let ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

let typewriterTimeout;

function typeWriterEffect(element, text, callback) {
    let i = 0;
    element.value = ''; // Clear the element before starting

    function typeWriter() {
        if (i < text.length) {
            element.value += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(typeWriter, 50);
        } else if (callback) {
            callback();
        }
    }
    
    typeWriter();
}

function clearTypewriterEffect() {
    clearTimeout(typewriterTimeout);
}

export { showChat, hideChat, addRippleEffect, typeWriterEffect, clearTypewriterEffect };