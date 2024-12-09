import React, { useState } from 'react';
import axios from 'axios';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [input, setInput] = useState('');

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const newMessage = { sender: 'User', text: input };
        setMessages([...messages, newMessage]);

        // Send the user's message to the backend (GPT API)
        try {
            const res = await axios.post('/api/gpt', { message: input });
            setMessages([...messages, newMessage, { sender: 'GPT', text: res.data.text }]);
        } catch (error) {
            console.error('Error communicating with GPT:', error);
        }

        setInput('');
    };

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">Chatbot</div>
                <div className="card-body">
                    <ul className="list-group">
                        {messages.map((msg, idx) => (
                            <li key={idx} className={`list-group-item ${msg.sender === 'GPT' ? 'bg-light' : ''}`}>
                                <strong>{msg.sender}:</strong> {msg.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card-footer">
                    <form onSubmit={sendMessage}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                            />
                            <div className="input-group-append">
                                <button className="btn btn-primary" type="submit">Send</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
