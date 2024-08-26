'use client';
import logo from '@/public/chatbotlogo.png';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

type Message = {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  useEffect(() => {
    // Add the default message when the component mounts
    const defaultMessage: Message = {
      text: "Hi! I'm your virtual MMA coach. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format timestamp to show hours and minutes
    };
    setMessages([defaultMessage]);
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userPrompt: input,
          history: messages
        }),
      });

      const data = await response.json();
      const userMessage: Message = {
        text: input,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format timestamp to show hours and minutes
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      
      const botMessage: Message = {
        text: data.text,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format timestamp to show hours and minutes
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: 'Sorry, something went wrong. Please try again later.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format timestamp to show hours and minutes
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents the default action of form submission
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col w-full max-w-md md:h-[600px] border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
      <div className="p-4 bg-gray-200 border-b border-gray-300 text-center font-bold">
        StrikeMMA Chatbot
      </div>
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 md:scrollbar-thumb-gray-500 lg:scrollbar-thumb-gray-600">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start mb-3 max-w-[75%] ${
              message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {message.sender === 'bot' && (
              <Image
                src={logo}
                alt="Bot Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <div>
              <div
                className={`p-2 rounded-lg ${
                  message.sender === 'user' ? 'bg-[#db2b34] text-white' : 'bg-gray-200'
                }`}
              >
                {message.text}
              </div>
              {message.sender === 'bot' && (
                <div className="text-xs text-gray-500 mt-1">
                  Coach
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Auto-scroll reference */}
      </div>
      <div className="flex items-center p-4 bg-white border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}  // Add this line to handle the "Enter" key
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-full outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          className="ml-3 px-4 py-2 bg-[#db2b34] text-white rounded-full hover:bg-[#db2b34]/80"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
