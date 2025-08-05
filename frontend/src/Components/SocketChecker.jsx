// SocketChecker.jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketChecker = () => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [socketId, setSocketId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000'); // ✅ Update if your backend runs elsewhere

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setSocketId(newSocket.id);
      setStatus('Connected');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setStatus('Disconnected');
    });

    newSocket.on('waitingForOpponent', (data) => {
      addMessage(`Waiting: ${data.message}`);
    });

    newSocket.on('gameStarted', (data) => {
      addMessage(`Game Started: ${JSON.stringify(data)}`);
    });

    newSocket.on('error', (data) => {
      addMessage(`Error: ${data.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startGame = () => {
    if (socket) {
      const playerId = 'player_' + Math.floor(Math.random() * 10000);
      socket.emit('startGame', playerId);
      addMessage(`Sent startGame for player ID: ${playerId}`);
    }
  };

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h2>🔌 Socket.IO Checker</h2>
      <p>Status: <strong>{status}</strong></p>
      <p>Socket ID: <code>{socketId}</code></p>
      <button onClick={startGame} style={{ padding: '10px 20px' }}>
        Start Game
      </button>

      <h3>📥 Messages</h3>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
};

export default SocketChecker;
