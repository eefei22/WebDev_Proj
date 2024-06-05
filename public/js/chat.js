const socket = io();

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

const chatId = '<%= chat._id %>';
const userId = '<%= session.userId %>';

socket.emit('joinRoom', { chatId });

socket.on('message', (message) => {
    const div = document.createElement('div');
    div.classList.add('message', message.senderId === userId ? 'self' : 'other');
    div.innerHTML = `<p>${message.message}</p><span>${new Date(message.timestamp).toLocaleTimeString()}</span>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('chatMessage', { chatId, senderId: userId, message });
    messageInput.value = '';
});
