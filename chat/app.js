document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // Add initial welcome message
    addMessage('Welcome to AIRNY Chat! How can I help you today?', 'bot');

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to handle sending messages
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            messageInput.value = '';
            
            // Check if message contains "I love you" (case insensitive)
            if (message.toLowerCase().includes('i love you')) {
                setTimeout(() => {
                    addMessage('I love you too! 💚', 'bot');
                }, 1000);
            } else {
                // Regular responses
                setTimeout(() => {
                    const responses = [
                        "I'm here to help you with air quality information in New York City.",
                        "You can ask me about air quality in specific neighborhoods.",
                        "I can provide real-time air quality data and forecasts.",
                        "Would you like to know about current air quality conditions?",
                        "I can help you understand air quality indices and their meanings."
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    addMessage(randomResponse, 'bot');
                }, 1000);
            }
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Focus the input field when the page loads
    messageInput.focus();
});
