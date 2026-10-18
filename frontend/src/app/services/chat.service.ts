import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  reply: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/session';

  constructor(private http: HttpClient) { }

  sendMessage(sessionId: string, message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/${sessionId}/`, { message });
  }

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/list/`);
  }

  getSessionMessages(sessionId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${sessionId}/`);
  }

  createSession(title: string = 'New Conversation'): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/create/`, { title });
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${sessionId}/`);
  }
}
