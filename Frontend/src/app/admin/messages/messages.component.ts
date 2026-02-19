import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationService, ConversationDB, MessageDB } from './services/conversation.service';
import { UsersService } from '../clients/services/users.service';
import { UserDB } from '../../core/models/admin.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  conversations = signal<ConversationDB[]>([]);
  messages = signal<MessageDB[]>([]);
  users = signal<UserDB[]>([]);
  boutiqueUsers = signal<UserDB[]>([]);
  lastMessages = signal<Map<string, MessageDB>>(new Map());

  selectedConversation = signal<ConversationDB | null>(null);
  newMessage = signal('');
  searchQuery = signal('');
  showNewConversationModal = signal(false);

  currentUserId: string = '';
  currentUser: UserDB | null = null;

  constructor(
    private conversationService: ConversationService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const localUser = JSON.parse(userStr);
      console.log('User from localStorage:', localUser);
      // The localStorage user has 'id' not '_id'
      this.currentUserId = localUser.user.id;
      this.currentUser = {
        _id: this.currentUserId,
        username: localUser.user.username,
        email: localUser.user.email,
        id_role: localUser.user.role
      } as UserDB;
      console.log('Current user:', localUser.user.id);
      console.log('Current user ID:', this.currentUserId);
      this.loadConversations();
      this.loadUsers();
    }
  }

  private loadConversations() {
    if (!this.currentUserId) return;
    
    this.conversationService.getConversationsByUser(this.currentUserId).subscribe({
      next: (conversations) => {
        this.conversations.set(conversations);
        // Load last message for each conversation
        conversations.forEach(conv => this.loadLastMessage(conv._id));
      },
      error: (err) => console.error('Error loading conversations:', err)
    });
  }

  private loadLastMessage(conversationId: string) {
    this.conversationService.getMessagesByConversation(conversationId).subscribe({
      next: (messages) => {
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const currentMap = new Map(this.lastMessages());
          currentMap.set(conversationId, lastMsg);
          this.lastMessages.set(currentMap);
        }
      }
    });
  }

  getLastMessage(conversationId: string): string {
    const lastMsg = this.lastMessages().get(conversationId);
    if (!lastMsg) return 'Aucun message';
    // Truncate message if too long
    const maxLength = 30;
    return lastMsg.message.length > maxLength 
      ? lastMsg.message.substring(0, maxLength) + '...' 
      : lastMsg.message;
  }

  private loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users.data);
        // Filter boutique users for new conversation
        const boutiques = users.data.filter((u: UserDB) => {
          const roleName = typeof u.id_role === 'object' ? u.id_role.role_name : '';
          return roleName === 'boutique' && u._id !== this.currentUserId;
        });
        this.boutiqueUsers.set(boutiques);
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  selectConversation(conv: ConversationDB) {
    this.selectedConversation.set(conv);
    this.conversationService.getMessagesByConversation(conv._id).subscribe({
      next: (messages) => this.messages.set(messages),
      error: (err) => console.error('Error loading messages:', err)
    });
  }

  sendMessage() {
    const messageText = this.newMessage().trim();
    const conv = this.selectedConversation();

    if (!messageText || !conv || !this.currentUserId) return;

    const otherParticipantId = conv.participants.find(p => p !== this.currentUserId);

    const newMsg: Partial<MessageDB> = {
      id_expediteur: this.currentUserId,
      id_receveur: otherParticipantId || '',
      message: messageText,
      id_conversation: conv._id
    };

    this.conversationService.sendMessage(newMsg).subscribe({
      next: () => {
        this.conversationService.getMessagesByConversation(conv._id).subscribe({
          next: (messages) => {
            this.messages.set(messages);
            // Update last message for this conversation
            this.loadLastMessage(conv._id);
          }
        });
        this.newMessage.set('');
      },
      error: (err) => console.error('Error sending message:', err)
    });
  }

  openNewConversationModal() {
    this.showNewConversationModal.set(true);
  }

  closeNewConversationModal() {
    this.showNewConversationModal.set(false);
  }

  startConversation(user: UserDB) {
    console.log('Starting conversation with user:', user);
    console.log('Current user ID:', this.currentUserId);
    console.log('Other user ID:', user._id);
    
    // Check if conversation already exists
    const existingConv = this.conversations().find(c => 
      c.participants.includes(user._id) && c.participants.includes(this.currentUserId)
    );

    if (existingConv) {
      this.selectConversation(existingConv);
      this.closeNewConversationModal();
      return;
    }

    // Validate IDs before creating
    if (!this.currentUserId || !user._id) {
      console.error('Invalid user IDs:', { currentUserId: this.currentUserId, otherUserId: user._id });
      return;
    }

    // Create new conversation
    this.conversationService.createConversation([this.currentUserId, user._id]).subscribe({
      next: (conversation) => {
        this.loadConversations();
        this.selectConversation(conversation);
        this.closeNewConversationModal();
      },
      error: (err) => console.error('Error creating conversation:', err)
    });
  }

  getFilteredConversations() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.conversations();

    return this.conversations().filter(c => {
      const otherUser = this.getOtherParticipant(c);
      return otherUser?.username.toLowerCase().includes(query);
    });
  }

  getOtherParticipant(conv: ConversationDB): UserDB | undefined {
    const otherParticipantId = conv.participants.find(p => p !== this.currentUserId);
    return this.users().find(u => u._id === otherParticipantId);
  }

  getRoleName(user: UserDB | undefined): string {
    if (!user || !user.id_role) return '';
    return typeof user.id_role === 'object' ? user.id_role.role_name : '';
  }

  formatTime(date: Date | string | undefined): string {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  formatMessageTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'admin': '👤',
      'boutique': '🏪',
      'client': '👥',
      'user': '👥'
    };
    return icons[role] || '👤';
  }

  isOwnMessage(msg: MessageDB): boolean {
    return msg.id_expediteur === this.currentUserId || 
           (typeof msg.id_expediteur === 'object' && (msg.id_expediteur as any)._id === this.currentUserId);
  }

  getInitials(user: UserDB | undefined): string {
    if (!user) return '?';
    const parts = user.username.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
  }
}
