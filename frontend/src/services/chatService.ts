const BASE_URL = 'http://localhost:8000/api/v1/session';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
}

export const chatService = {
  async getSessions(): Promise<Session[]> {
    const res = await fetch(`${BASE_URL}/list/`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async createSession(title: string = 'New Conversation'): Promise<Session> {
    const res = await fetch(`${BASE_URL}/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(`${BASE_URL}/${sessionId}/`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const res = await fetch(`${BASE_URL}/${sessionId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'Failed to send message');
    }
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${sessionId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },
};
