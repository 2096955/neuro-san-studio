# ChatBox Component

A beautiful, ChatGPT-like conversational UI component for interacting with agentic systems.

## Features

✨ **Modern UI**
- Clean, ChatGPT-inspired design
- Smooth animations and transitions
- Responsive layout

💬 **Rich Messaging**
- User and assistant message bubbles
- System messages for notifications
- Timestamps for each message
- Auto-scroll to latest message

🎨 **Visual Feedback**
- Typing indicator while waiting for response
- Loading states
- Avatar icons for user/assistant
- Color-coded message types

🔧 **Customizable**
- Custom system name
- Custom placeholder text
- Adjustable height
- Initial messages support
- Custom message handler

## Usage

### Basic Example

```tsx
import ChatBox from './components/common/ChatBox';

function MyPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Call your backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return data.response;
  };

  return (
    <ChatBox
      systemName="AI Assistant"
      onSendMessage={handleSendMessage}
      placeholder="Type your message..."
      height="600px"
    />
  );
}
```

### With Initial Messages

```tsx
import ChatBox, { Message } from './components/common/ChatBox';

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: new Date(),
  },
];

<ChatBox
  systemName="Travel Assistant"
  initialMessages={initialMessages}
  onSendMessage={handleSendMessage}
/>
```

### Integration with SlideOutPage

Add a new tab to your SlideOutPage:

```tsx
// In SlideOutPage.tsx
import ChatBox from '../components/common/ChatBox';

// Add 'chat' to your tab types
type TabType = 'overview' | 'graph' | 'agents-tools' | 'raw-config' | 'chat';

// In your renderContent function:
case 'chat':
  return (
    <div className="p-4">
      {selectedSystem ? (
        <ChatBox
          systemName={selectedSystem.metadata.system}
          onSendMessage={handleChatMessage}
          placeholder={`Chat with ${selectedSystem.metadata.system}...`}
          height="calc(100vh - 250px)"
        />
      ) : (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
          <p className="text-gray-600 mt-2">Select a system to start chatting</p>
        </div>
      )}
    </div>
  );
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `systemName` | `string` | `'AI Assistant'` | Name of the AI system displayed in header |
| `onSendMessage` | `(message: string) => Promise<string>` | `undefined` | Handler for sending messages. Should return AI response |
| `initialMessages` | `Message[]` | `[]` | Array of initial messages to display |
| `placeholder` | `string` | `'Type your message...'` | Placeholder text for input field |
| `className` | `string` | `''` | Additional CSS classes |
| `height` | `string` | `'600px'` | Height of the chat box |

## Message Interface

```typescript
interface Message {
  id: string;              // Unique message ID
  role: 'user' | 'assistant' | 'system';  // Message sender
  content: string;         // Message text
  timestamp: Date;         // When message was sent
}
```

## Message Roles

- **`user`**: Messages from the user (blue, right-aligned)
- **`assistant`**: Messages from the AI (white, left-aligned)
- **`system`**: System notifications (yellow, left-aligned)

## Backend Integration

### Expected API Format

Your `onSendMessage` handler should call your backend API. Example:

```typescript
const handleSendMessage = async (message: string): Promise<string> => {
  const response = await fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      system: 'airbnb',
      session_id: 'user-session-123'
    }),
  });

  const data = await response.json();
  return data.response;
};
```

### Backend Endpoint Example (FastAPI)

```python
@router.post("/api/chat")
async def chat(request: ChatRequest):
    """Handle chat messages"""
    message = request.message
    system = request.system
    
    # Process with your agentic system
    response = await process_with_agent(system, message)
    
    return {"response": response}
```

## Styling

The component uses Material-UI (MUI) for styling. You can customize colors by modifying the `sx` props in the component.

### Color Scheme

- **User messages**: `#4285f4` (Blue)
- **Assistant messages**: `#fff` (White with border)
- **System messages**: `#fef3c7` (Yellow)
- **Background**: `#f9fafb` (Light gray)

## Features in Detail

### Auto-scroll
Messages automatically scroll to the bottom when new messages arrive.

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in message

### Loading States
- Shows "Typing..." indicator in header
- Displays animated loading bubble while waiting for response

### Clear Conversation
Click the refresh icon in the header to clear all messages.

## Example: Complete Integration

See `ChatBoxDemo.tsx` for a complete working example with mock API integration.

## Tips

1. **Error Handling**: Always wrap your API calls in try-catch blocks
2. **Session Management**: Consider adding session IDs to maintain conversation context
3. **Streaming**: For long responses, consider implementing streaming responses
4. **History**: Store conversation history in localStorage or backend
5. **Typing Indicators**: The component shows loading state automatically

## Future Enhancements

Potential features to add:
- Markdown rendering in messages
- Code syntax highlighting
- File attachments
- Voice input
- Message reactions
- Conversation history/sessions
- Export conversation
