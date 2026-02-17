import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Conversation, Message, User } from '../../core/models/admin.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  users = signal<User[]>([]);

  selectedConversation = signal<Conversation | null>(null);
  newMessage = signal('');
  searchQuery = signal('');
  showNewConversation = signal(false);
  showEmailModal = signal(false);

  emailData = {
    destinataire: '',
    sujet: '',
    template: 'notificationGenerale',
    message: ''
  };

  emailTemplates = [
    { id: 'retardPaiement', label: 'Retard de paiement' },
    { id: 'promotionValidee', label: 'Promotion validée' },
    { id: 'notificationGenerale', label: 'Notification générale' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.adminService.getConversations().subscribe(c => this.conversations.set(c));
    this.adminService.getUsers().subscribe(u => this.users.set(u));
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.adminService.getMessages(conv.id).subscribe(m => {
      this.messages.set(m);
    });
  }

  sendMessage() {
    const message = this.newMessage().trim();
    const conv = this.selectedConversation();

    if (!message || !conv) return;

    const otherParticipant = conv.participants.find(p => p.role !== 'admin');

    this.adminService.sendMessage({
      expediteurId: 'user-1',
      expediteurNom: 'Admin',
      expediteurRole: 'admin',
      destinataireId: otherParticipant?.id || '',
      destinataireNom: otherParticipant?.nom || '',
      contenu: message
    }).subscribe(() => {
      this.adminService.getMessages(conv.id).subscribe(m => {
        this.messages.set(m);
      });
      this.newMessage.set('');
    });
  }

  openEmailModal() {
    this.emailData = {
      destinataire: '',
      sujet: '',
      template: 'notificationGenerale',
      message: ''
    };
    this.showEmailModal.set(true);
  }

  closeEmailModal() {
    this.showEmailModal.set(false);
  }

  sendEmail() {
    this.adminService.sendEmail(
      this.emailData.template,
      this.emailData.destinataire,
      { message: this.emailData.message }
    ).subscribe(() => {
      this.closeEmailModal();
      // Show success notification
    });
  }

  getFilteredConversations() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.conversations();

    return this.conversations().filter(c =>
      c.participants.some(p => p.nom.toLowerCase().includes(query))
    );
  }

  formatTime(date: Date): string {
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

  formatMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOtherParticipant(conv: Conversation) {
    return conv.participants.find(p => p.role !== 'admin');
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      'admin': 'admin_panel_settings',
      'boutique': 'store',
      'client': 'person'
    };
    return icons[role] || 'person';
  }

  isOwnMessage(msg: Message): boolean {
    return msg.expediteurRole === 'admin';
  }
}
