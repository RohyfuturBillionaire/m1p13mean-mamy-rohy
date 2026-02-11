import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

export interface ConversationDB {
  _id: string;
  participants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageDB {
  _id: string;
  id_expediteur: string;
  id_receveur: string;
  message: string;
  date_envoie: Date;
  id_conversation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private baseUrl = environment.apiUrl; // Ensure this is set to your backend API URL

  constructor(private http: HttpClient) {}

  // GET /conversations/:userId - Get all conversations for a user
  getConversationsByUser(userId: string): Observable<ConversationDB[]> {
    return this.http.get<ConversationDB[]>(`${this.baseUrl}/conversations/${userId}`);
  }

  // POST /conversations - Create a new conversation
  createConversation(participants: string[]): Observable<ConversationDB> {
    return this.http.post<ConversationDB>(`${this.baseUrl}/conversations`, { participants });
  }

  // GET /messages/:conversationId - Get messages for a conversation
  getMessagesByConversation(conversationId: string): Observable<MessageDB[]> {
    return this.http.get<MessageDB[]>(`${this.baseUrl}/messages/${conversationId}`);
  }

  // POST /messages - Send a message
  sendMessage(message: Partial<MessageDB>): Observable<MessageDB> {
    return this.http.post<MessageDB>(`${this.baseUrl}/messages`, message);
  }
}
