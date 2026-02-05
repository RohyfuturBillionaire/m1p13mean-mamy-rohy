import { Component, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { SellerConversation, SellerMessage } from '../../core/models/seller.model';

@Component({
  selector: 'app-seller-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-messages.component.html',
  styleUrl: './seller-messages.component.scss'
})
export class SellerMessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations = signal<SellerConversation[]>([]);
  messages = signal<SellerMessage[]>([]);
  selectedConversation = signal<SellerConversation | null>(null);
  newMessage = signal('');
  isSending = signal(false);
  private shouldScroll = false;

  unreadTotal = computed(() => this.conversations().reduce((acc, c) => acc + c.nonLus, 0));

  constructor(private sellerService: SellerService) {}

  ngOnInit() { this.loadConversations(); }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations() {
    this.sellerService.getConversations().subscribe(c => this.conversations.set(c));
  }

  selectConversation(conv: SellerConversation) {
    this.selectedConversation.set(conv);
    this.sellerService.getMessages(conv.id).subscribe(m => {
      this.messages.set(m);
      this.shouldScroll = true;
    });
    this.sellerService.markConversationAsRead(conv.id);
    this.loadConversations();
  }

  sendMessage() {
    const msg = this.newMessage().trim();
    const conv = this.selectedConversation();
    if (!msg || !conv) return;

    this.isSending.set(true);
    this.sellerService.sendMessage(conv.id, msg).subscribe(newMsg => {
      this.messages.update(m => [...m, newMsg]);
      this.newMessage.set('');
      this.isSending.set(false);
      this.shouldScroll = true;
      this.loadConversations();
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatDate(date: Date): string { return this.sellerService.getRelativeTime(date); }
  formatFullDate(date: Date): string { return this.sellerService.formatDateTime(date); }

  getParticipantIcon(type: string): string {
    return type === 'admin' ? 'admin_panel_settings' : 'person';
  }

  isOwnMessage(msg: SellerMessage): boolean {
    return msg.expediteurRole === 'boutique';
  }
}
