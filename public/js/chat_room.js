// public/js/chat_room.js
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const messageContainer = document.getElementById('messages');

    const appendMessage = (data, isOwnMessage) => {
        const messageElement = document.createElement('div');
        messageElement.className = isOwnMessage ? 'message-right' : 'message-left';
        messageElement.innerHTML = `
            <p><strong>${isOwnMessage ? 'You' : data.senderName}:</strong> ${data.message}</p>
            <small>${new Date(data.dateTime).toLocaleString()}</small>
        `;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
    };

    socket.on('chat-message', (data) => {
        appendMessage(data, data.sender === userId);
    });

    const messageForm = document.getElementById('message-form');
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = event.target.elements.message.value;
        const tutorId = event.target.elements.tutorId.value;

        if (message.trim() === '') return; // Prevent sending empty messages

        const data = { message, tutorId, senderName: 'You', dateTime: new Date() };
        appendMessage(data, true); // Append message immediately
        socket.emit('message', { message, tutorId });
        event.target.elements.message.value = '';
    });
});
