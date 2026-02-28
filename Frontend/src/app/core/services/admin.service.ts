import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  User, Contrat, Paiement, Facture, DemandePromotion,
  Conversation, Message, KPI
} from '../models/admin.model';
import {
  MOCK_USERS, MOCK_CONTRATS, MOCK_PAIEMENTS, MOCK_FACTURES,
  MOCK_DEMANDES_PROMOTION, MOCK_CONVERSATIONS, MOCK_MESSAGES,
  REVENUS_MENSUELS, LOYERS_PAR_BOUTIQUE, STATS_PROMOTIONS, VISITEURS_MENSUELS
} from '../data/admin-mock-data';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private users = signal<User[]>([...MOCK_USERS]);
  private contrats = signal<Contrat[]>([...MOCK_CONTRATS]);
  private paiements = signal<Paiement[]>([...MOCK_PAIEMENTS]);
  private factures = signal<Facture[]>([...MOCK_FACTURES]);
  private demandesPromotion = signal<DemandePromotion[]>([...MOCK_DEMANDES_PROMOTION]);
  private conversations = signal<Conversation[]>([...MOCK_CONVERSATIONS]);
  private messages = signal<Message[]>([...MOCK_MESSAGES]);
  private isAuthenticated = signal(false);
  private currentUser = signal<User | null>(null);

  // ===== Authentication =====
  login(username: string, password: string): Observable<boolean> {
    // Simulation de login admin
    if (username === 'admin' && password === 'admin') {
      this.isAuthenticated.set(true);
      this.currentUser.set(this.users().find(u => u.role === 'admin') || null);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // ===== KPIs =====
  getKPIs(): Observable<KPI[]> {
    const totalBoutiques = this.contrats().filter(c => c.statut === 'actif').length;
    const chiffreAffaires = this.paiements()
      .filter(p => p.statut === 'paye')
      .reduce((sum, p) => sum + p.montant, 0);
    const totalClients = this.users().filter(u => u.role === 'client').length;
    const visiteurs = 67000; // Mock

    const kpis: KPI[] = [
      {
        label: 'Boutiques Actives',
        value: totalBoutiques,
        change: 12,
        icon: 'store',
        color: '#C9A962'
      },
      {
        label: 'Chiffre d\'Affaires',
        value: this.formatMontant(chiffreAffaires),
        change: 8.5,
        icon: 'trending_up',
        color: '#4CAF50'
      },
      {
        label: 'Clients Inscrits',
        value: totalClients,
        change: 15,
        icon: 'people',
        color: '#2196F3'
      },
      {
        label: 'Visiteurs/Mois',
        value: this.formatNumber(visiteurs),
        change: 23,
        icon: 'visibility',
        color: '#9C27B0'
      }
    ];
    return of(kpis);
  }

  // ===== Users (Clients) =====
  getUsers(): Observable<User[]> {
    return of(this.users());
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.users().find(u => u.id === id));
  }

  addUser(user: Omit<User, 'id' | 'dateInscription'>): Observable<User> {
    const newUser: User = {
      ...user,
      id: 'user-' + Date.now(),
      dateInscription: new Date()
    };
    this.users.update(users => [...users, newUser]);
    return of(newUser);
  }

  updateUser(id: string, updates: Partial<User>): Observable<User | null> {
    const index = this.users().findIndex(u => u.id === id);
    if (index !== -1) {
      const updated = { ...this.users()[index], ...updates };
      this.users.update(users => {
        const newUsers = [...users];
        newUsers[index] = updated;
        return newUsers;
      });
      return of(updated);
    }
    return of(null);
  }

  deleteUser(id: string): Observable<boolean> {
    this.users.update(users => users.filter(u => u.id !== id));
    return of(true);
  }

  // ===== Contrats =====
  getContrats(): Observable<Contrat[]> {
    return of(this.contrats());
  }

  addContrat(contrat: Omit<Contrat, 'id'>): Observable<Contrat> {
    const newContrat: Contrat = {
      ...contrat,
      id: 'contrat-' + Date.now()
    };
    this.contrats.update(c => [...c, newContrat]);
    return of(newContrat);
  }

  updateContrat(id: string, updates: Partial<Contrat>): Observable<Contrat | null> {
    const index = this.contrats().findIndex(c => c.id === id);
    if (index !== -1) {
      const updated = { ...this.contrats()[index], ...updates };
      this.contrats.update(contrats => {
        const newContrats = [...contrats];
        newContrats[index] = updated;
        return newContrats;
      });
      return of(updated);
    }
    return of(null);
  }

  // ===== Paiements =====
  getPaiements(): Observable<Paiement[]> {
    return of(this.paiements());
  }

  updatePaiementStatut(id: string, statut: Paiement['statut']): Observable<boolean> {
    const index = this.paiements().findIndex(p => p.id === id);
    if (index !== -1) {
      this.paiements.update(paiements => {
        const newPaiements = [...paiements];
        newPaiements[index] = { ...newPaiements[index], statut, datePaiement: new Date() };
        return newPaiements;
      });
      return of(true);
    }
    return of(false);
  }

  // ===== Factures =====
  getFactures(): Observable<Facture[]> {
    return of(this.factures());
  }

  generateFacture(contratId: string, mois: string): Observable<Facture> {
    const contrat = this.contrats().find(c => c.id === contratId);
    if (!contrat) throw new Error('Contrat non trouvé');

    const newFacture: Facture = {
      id: 'fact-' + Date.now(),
      numero: `FACT-${new Date().getFullYear()}-${String(this.factures().length + 1).padStart(3, '0')}`,
      contratId,
      boutiqueNom: contrat.nomEntreprise,
      clientNom: contrat.nomClient,
      montant: contrat.loyerMensuel,
      tva: contrat.loyerMensuel * 0.2,
      total: contrat.loyerMensuel * 1.2,
      dateEmission: new Date(),
      dateEcheance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      statut: 'en_attente'
    };
    this.factures.update(f => [...f, newFacture]);
    return of(newFacture);
  }

  // ===== Promotions =====
  getDemandesPromotion(): Observable<DemandePromotion[]> {
    return of(this.demandesPromotion());
  }

  updateDemandePromotion(id: string, statut: DemandePromotion['statut']): Observable<boolean> {
    const index = this.demandesPromotion().findIndex(d => d.id === id);
    if (index !== -1) {
      this.demandesPromotion.update(demandes => {
        const newDemandes = [...demandes];
        newDemandes[index] = { ...newDemandes[index], statut };
        return newDemandes;
      });
      return of(true);
    }
    return of(false);
  }

  // ===== Messages & Conversations =====
  getConversations(): Observable<Conversation[]> {
    return of(this.conversations());
  }

  getMessages(conversationId: string): Observable<Message[]> {
    const conv = this.conversations().find(c => c.id === conversationId);
    if (!conv) return of([]);

    const participantIds = conv.participants.map(p => p.id);
    return of(this.messages().filter(m =>
      participantIds.includes(m.expediteurId) && participantIds.includes(m.destinataireId)
    ));
  }

  sendMessage(message: Omit<Message, 'id' | 'dateEnvoi' | 'lu'>): Observable<Message> {
    const newMessage: Message = {
      ...message,
      id: 'msg-' + Date.now(),
      dateEnvoi: new Date(),
      lu: false
    };
    this.messages.update(m => [...m, newMessage]);
    return of(newMessage);
  }

  // ===== Charts Data =====
  getRevenueData() {
    return of(REVENUS_MENSUELS);
  }

  getLoyersData() {
    return of(LOYERS_PAR_BOUTIQUE);
  }

  getPromotionsStats() {
    return of(STATS_PROMOTIONS);
  }

  getVisiteursData() {
    return of(VISITEURS_MENSUELS);
  }

  // ===== Helpers =====
  private formatMontant(montant: number): string {
    if (montant >= 1000000) {
      return (montant / 1000000).toFixed(1) + 'M Ar';
    }
    return montant.toLocaleString() + ' Ar';
  }

  private formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}
