import React from 'react';
import { Box } from '@mui/material';
import ChatBox, { type Message } from './ChatBox';
import { chatService } from '../../services/ChatService';

/**
 * Demo component showing how to use ChatBox with ChatService.
 * Uses backend /api/chat with network_name; errors are surfaced to the user.
 */
const ChatBoxDemo: React.FC = () => {
  const initialMessages: Message[] = [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ];

  const handleSendMessage = async (message: string): Promise<string> => {
    const response = await chatService.sendMessage({
      message,
      network_name: 'airbnb',
    });
    return response.response;
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Chat with AI Assistant
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Have a conversation with your agentic system
        </p>
      </Box>

      <ChatBox
        systemName="Airbnb Travel Assistant"
        onSendMessage={handleSendMessage}
        initialMessages={initialMessages}
        placeholder="Ask me anything about travel, accommodations, or bookings..."
        height="700px"
      />
    </Box>
  );
};

export default ChatBoxDemo;
