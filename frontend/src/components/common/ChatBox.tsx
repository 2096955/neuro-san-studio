import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Avatar, CircularProgress, Tooltip, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import BalanceIcon from '@mui/icons-material/Balance';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { chatService, type PrebakedPrompt } from '../../services/ChatService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatBoxProps {
  systemName?: string;
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: Message[];
  placeholder?: string;
  className?: string;
  height?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  systemName = 'AI Assistant',
  onSendMessage,
  initialMessages = [],
  placeholder = 'Type your message...',
  className = '',
  height = '600px',
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prebakedPrompts, setPrebakedPrompts] = useState<PrebakedPrompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch pre-baked prompts from API
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoadingPrompts(true);
        const response = await chatService.getPrompts();
        setPrebakedPrompts(response.prompts);
      } catch (error) {
        console.error('Error fetching pre-baked prompts:', error);
        // Keep empty array if fetch fails
      } finally {
        setLoadingPrompts(false);
      }
    };

    fetchPrompts();
  }, []);

  // Map icon names to actual icon components
  const getIconComponent = (iconText: string) => {
    switch (iconText) {
      case '🔒':
        return <VisibilityOffIcon sx={{ fontSize: 16 }} />;
      case '⚖️':
        return <BalanceIcon sx={{ fontSize: 16 }} />;
      case '♿':
        return <WarningAmberIcon sx={{ fontSize: 16 }} />;
      case '🛡️':
        return <SecurityIcon sx={{ fontSize: 16 }} />;
      default:
        return <SecurityIcon sx={{ fontSize: 16 }} />;
    }
  };

  // Handle quick prompt click
  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    // Optionally auto-send
    // handleSend();
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the onSendMessage handler if provided
      if (!onSendMessage) {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-system`,
            role: 'system',
            content: 'Connect an onSendMessage handler to enable conversations.',
            timestamp: new Date(),
          },
        ]);
        return;
      }
      const response = await onSendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errMsg = error instanceof Error ? error.message : 'Sorry, there was an error processing your message. Please try again.';
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: errMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear conversation
  const handleClear = () => {
    setMessages([]);
    setInputValue('');
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      className={className}
      role="region"
      aria-label={`Chat with ${systemName}`}
      data-testid="chatbox"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height,
        border: '1px solid var(--color-border)',
        borderRadius: 2,
        bgcolor: 'var(--color-card)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid var(--color-border)',
          bgcolor: 'var(--color-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 32, height: 32 }} aria-hidden="true">
            <SmartToyIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-foreground)' }}>
              {systemName}
            </Box>
            <Box sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {isLoading ? 'Typing...' : 'Online'}
            </Box>
          </Box>
        </Box>
        <Tooltip title="Clear conversation">
          <IconButton size="small" onClick={handleClear} aria-label="Clear conversation">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Prompts - Responsible AI Tests - Always visible */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid var(--color-border)',
          bgcolor: 'var(--color-card)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', mb: 1 }}>
          <SecurityIcon sx={{ fontSize: '1rem', color: '#6b7280' }} />
          Responsible AI Quick Tests
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {loadingPrompts ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9ca3af', fontSize: '0.75rem' }}>
              <CircularProgress size={14} />
              <span>Loading prompts...</span>
            </Box>
          ) : prebakedPrompts.length > 0 ? (
            prebakedPrompts.map((prompt: PrebakedPrompt, index: number) => (
              <Chip
                key={prompt.id || index}
                icon={getIconComponent(prompt.icon)}
                label={prompt.label}
                onClick={() => handleQuickPrompt(prompt.prompt)}
                size="small"
                sx={{
                  bgcolor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: prompt.color,
                    color: '#fff',
                    borderColor: prompt.color,
                    '& .MuiChip-icon': {
                      color: '#fff',
                    },
                  },
                  '& .MuiChip-icon': {
                    color: prompt.color,
                  },
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            ))
          ) : (
            <Box sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
              No quick prompts available
            </Box>
          )}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        data-testid="chat-messages"
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#9ca3af',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Box sx={{ fontSize: '0.875rem' }}>
              Start a conversation with {systemName}
            </Box>
            <Box sx={{ fontSize: '0.75rem' }}>
              Ask questions, get assistance, or explore capabilities
            </Box>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  bgcolor:
                    message.role === 'user'
                      ? 'var(--color-success)'
                      : message.role === 'system'
                      ? '#f59e0b'
                      : 'var(--color-primary)',
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                }}
              >
                {message.role === 'user' ? (
                  <PersonIcon sx={{ fontSize: 18 }} />
                ) : (
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                )}
              </Avatar>

              {/* Message Bubble */}
              <Box
                sx={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor:
                      message.role === 'user'
                        ? 'var(--color-primary)'
                        : message.role === 'system'
                        ? '#fef3c7'
                        : 'var(--color-card)',
                    color:
                      message.role === 'user'
                        ? 'var(--color-primary-foreground)'
                        : message.role === 'system'
                        ? '#92400e'
                        : 'var(--color-foreground)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    boxShadow:
                      message.role === 'user'
                        ? 'none'
                        : '0 1px 2px rgba(0,0,0,0.05)',
                    border:
                      message.role === 'system'
                        ? '1px solid #fcd34d'
                        : message.role === 'user'
                        ? 'none'
                        : '1px solid #e5e7eb',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.content}
                </Box>
                <Box
                  sx={{
                    fontSize: '0.7rem',
                    color: '#9ca3af',
                    px: 0.5,
                    textAlign: message.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {formatTime(message.timestamp)}
                </Box>
              </Box>
            </Box>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 32, height: 32 }}>
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Box sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Thinking...
              </Box>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid var(--color-border)',
          bgcolor: 'var(--color-card)',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          variant="outlined"
          size="small"
          inputProps={{
            'aria-label': 'Message input',
            'data-testid': 'chat-input',
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f9fafb',
              '&:hover': {
                bgcolor: '#f3f4f6',
              },
              '&.Mui-focused': {
                bgcolor: '#fff',
              },
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          aria-label="Send message"
          data-testid="chat-send"
          sx={{
            bgcolor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
            flexShrink: 0,
            '&:hover': {
              bgcolor: 'var(--color-primary-hover)',
            },
            '&.Mui-disabled': {
              bgcolor: '#e5e7eb',
              color: '#9ca3af',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatBox;
