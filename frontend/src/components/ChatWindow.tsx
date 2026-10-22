import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../services/chatService';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 300);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="chat-window">
      <div
        className="messages-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
            <h3>Generate Brand Names</h3>
            <p>Describe your product or service, and our AI will recommend a unique, memorable brand name!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="avatar bot-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2M5 14v8h14v-8H5m2 2h2v2H7v-2m4 0h2v2h-2v-2m4 0h2v2h-2v-2Z"/>
              </svg>
            </div>
            <div className="bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={scrollAnchorRef} />
      </div>

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={scrollToTop}
          title="Scroll to first prompt"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
};
