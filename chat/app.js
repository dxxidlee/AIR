document.addEventListener('DOMContentLoaded', () => {
    // Create an array of chat instances
    const chats = [1, 2, 3, 4].map(index => ({
        container: document.getElementById(`chat-${index}`),
        messageInput: document.getElementById(`message-input-${index}`),
        sendButton: document.getElementById(`send-button-${index}`),
        chatMessages: document.getElementById(`chat-messages-${index}`),
        toggle: document.querySelector(`.chat-tabs .chat-toggle:nth-child(${index})`)
    }));

    let currentChatIndex = 1;
    let currentIndex = 0; // Initialize currentIndex for gradient tracking

    // Define gradient sets exactly as in home page
    const gradientSets = [
        {
            startHue: 115,
            endHue: 315
        },
        {
            startHue: 60,
            endHue: 229
        },
        {
            startHue: 30,
            endHue: 210
        },
        {
            startHue: 0,
            endHue: 180
        }
    ];

    // Function to interpolate between hues
    function interpolateHue(start, end, progress) {
        // Handle hue wrapping around 360 degrees
        let diff = end - start;
        if (Math.abs(diff) > 180) {
            if (diff > 0) {
                start += 360;
            } else {
                end += 360;
            }
        }
        let result = start + (end - start) * progress;
        return result % 360;
    }

    // Function to update gradient with smooth transitions
    function updateGradient(currentProgress) {
        const currentSet = gradientSets[currentIndex];
        const nextSet = gradientSets[(currentIndex + 1) % gradientSets.length];

        // Interpolate between current and next gradient sets
        const startHue = interpolateHue(currentSet.startHue, nextSet.startHue, currentProgress);
        const endHue = interpolateHue(currentSet.endHue, nextSet.endHue, currentProgress);

        const startColor = `hsl(${startHue}, 100%, 50%)`;
        const endColor = `hsl(${endHue}, 100%, 50%)`;
        
        const backgroundElement = document.querySelector('.background');
        backgroundElement.style.background = `radial-gradient(circle 110vh at 30% 50%, ${startColor} 0%, ${endColor} 70%)`;
    }

    // Function to smoothly transition between gradients
    function smoothTransition(fromIndex, toIndex, duration = 1000) {
        const startTime = performance.now();
        const fromSet = gradientSets[fromIndex];
        const toSet = gradientSets[toIndex];

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easing function for smoother transition
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const startHue = interpolateHue(fromSet.startHue, toSet.startHue, easedProgress);
            const endHue = interpolateHue(fromSet.endHue, toSet.endHue, easedProgress);

            const startColor = `hsl(${startHue}, 100%, 50%)`;
            const endColor = `hsl(${endHue}, 100%, 50%)`;

            const backgroundElement = document.querySelector('.background');
            backgroundElement.style.background = `radial-gradient(circle 110vh at 30% 50%, ${startColor} 0%, ${endColor} 70%)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Add initial welcome message to each chat
    chats.forEach(chat => {
        addMessage('Welcome to AIRNY Chat! How can I help you today?', 'bot', chat.chatMessages);
    });

    // Function to add a message to a specific chat
    function addMessage(text, sender, chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to handle sending messages for a specific chat
    function createSendMessageHandler(chat) {
        return () => {
            const message = chat.messageInput.value.trim();
            if (message) {
                addMessage(message, 'user', chat.chatMessages);
                chat.messageInput.value = '';
                
                // Check if message contains "I love you" (case insensitive)
                if (message.toLowerCase().includes('i love you')) {
                    setTimeout(() => {
                        addMessage('I love you too! 💚', 'bot', chat.chatMessages);
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
                        addMessage(randomResponse, 'bot', chat.chatMessages);
                    }, 1000);
                }
            }
        };
    }

    // Function to handle chat tab switching with smooth gradient transition
    window.toggleChat = (index) => {
        const selectedChat = chats[index - 1];
        const previousIndex = currentIndex;
        
        // Close all chats first
        chats.forEach(chat => {
            chat.container.classList.add('collapsed');
            chat.toggle.classList.remove('active');
        });
        
        // Update indices
        currentChatIndex = index;
        currentIndex = index - 1;
        
        // Smoothly transition the gradient
        smoothTransition(previousIndex, currentIndex);
        
        // Open selected chat with delay to allow for transition
        setTimeout(() => {
            selectedChat.container.classList.remove('collapsed');
            selectedChat.toggle.classList.add('active');
            selectedChat.messageInput.focus();
        }, 100);
    };

    // Set up event listeners for each chat
    chats.forEach(chat => {
        chat.sendButton.addEventListener('click', createSendMessageHandler(chat));
        chat.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createSendMessageHandler(chat)();
            }
        });
    });

    // Open first chat by default
    toggleChat(1);
});
