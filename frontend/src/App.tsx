import React, { useState, useEffect } from 'react';
import { chatService, Message, Session } from './services/chatService';
import { ChatWindow } from './components/ChatWindow';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);

  // Close session action menu on outside click
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveMenuSessionId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const loadSessions = async (autoSelectFirst: boolean = true) => {
    try {
      const sessions = await chatService.getSessions();
      setRecentSessions(sessions);

      if (autoSelectFirst) {
        if (sessions.length > 0) {
          const activeExists = currentSession && sessions.some(s => s.session_id === currentSession.session_id);
          if (!activeExists) {
            selectSession(sessions[0]);
          }
        } else {
          createNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions(true);
  }, []);

  const selectSession = async (session: Session) => {
    setCurrentSession(session);
    setErrorMessage('');
    setIsLoading(true);
    setMessages([]);
    try {
      const msgs = await chatService.getSessionMessages(session.session_id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setErrorMessage('Failed to load message history.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const newSession = await chatService.createSession('New Conversation');
      setCurrentSession(newSession);
      setMessages([]);
      setRecentSessions(prev => [newSession, ...prev]);
    } catch (err) {
      console.error('Failed to create session:', err);
      setErrorMessage('Failed to create a new session.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSessionMenu = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setActiveMenuSessionId(prev => (prev === sessionId ? null : sessionId));
  };

  const deleteSession = async (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    setActiveMenuSessionId(null);
    setIsLoading(true);
    setErrorMessage('');

    const wasCurrent = currentSession?.session_id === session.session_id;

    try {
      await chatService.deleteSession(session.session_id);
      if (wasCurrent) {
        setCurrentSession(null);
        setMessages([]);
      }
      await loadSessions(true);
    } catch (err) {
      console.error('Failed to delete session:', err);
      setErrorMessage('Failed to delete session.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!currentSession) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      await chatService.deleteSession(currentSession.session_id);
      setCurrentSession(null);
      setMessages([]);
      await loadSessions(true);
    } catch (err) {
      console.error('Failed to clear chat:', err);
      setErrorMessage('Failed to delete session.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text || isLoading) return;

    if (!currentSession) {
      setErrorMessage('No active session selected. Creating a new session...');
      await createNewSession();
      return;
    }

    setUserInput('');
    setErrorMessage('');
    setIsLoading(true);

    const optimisticMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(optimisticMessages);

    try {
      const res = await chatService.sendMessage(currentSession.session_id, text);
      setMessages([...optimisticMessages, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to reach the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={createNewSession}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>New Chat</span>
        </button>

        <div className="sidebar-content">
          <div className="history-label">Recent</div>
          <div className="history-list">
            {recentSessions.map(session => (
              <div
                key={session.session_id}
                className={`history-item ${currentSession?.session_id === session.session_id ? 'active' : ''}`}
                onClick={() => selectSession(session)}
              >
                <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="history-title">{session.title}</span>

                <div className="session-menu-wrapper" onClick={e => e.stopPropagation()}>
                  <button
                    className="more-btn"
                    type="button"
                    onClick={e => toggleSessionMenu(e, session.session_id)}
                    title="More options"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                  </button>

                  {activeMenuSessionId === session.session_id && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item delete-item"
                        type="button"
                        onClick={e => deleteSession(e, session)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">B</div>
            <span>Brian</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="model-info">
            <div className="header-bot-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2M5 14v8h14v-8H5m2 2h2v2H7v-2m4 0h2v2h-2v-2m4 0h2v2h-2v-2Z"/>
              </svg>
            </div>
            <div className="model-text">
              <span className="model-name">ChatGPT</span>
              <span className="model-sub">Powered by Llama-3.3 on Groq</span>
            </div>
            <span className="status-badge">Online</span>
          </div>

          <button
            className="clear-btn"
            onClick={clearChat}
            title="Clear chat"
            disabled={messages.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </header>

        <div className="message-container-wrapper">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>

        <div className="input-container-wrapper">
          {errorMessage && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/>
              </svg>
              {errorMessage}
            </div>
          )}

          <div className="input-box">
            <textarea
              id="chat-input"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your product (e.g. 'a solar-powered coffee maker')..."
              rows={1}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              id="send-btn"
              className="send-btn"
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
          <p className="disclaimer">AI can make mistakes. Check important info.</p>
        </div>
      </main>
    </div>
  );
};
