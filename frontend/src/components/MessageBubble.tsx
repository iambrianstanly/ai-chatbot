import React from 'react';
import { Message } from '../services/chatService';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      {!isUser && (
        <div className="avatar bot-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2M5 14v8h14v-8H5m2 2h2v2H7v-2m4 0h2v2h-2v-2m4 0h2v2h-2v-2Z"/>
          </svg>
        </div>
      )}

      <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
        <p>{message.content}</p>
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"/>
          </svg>
        </div>
      )}
    </div>
  );
};
