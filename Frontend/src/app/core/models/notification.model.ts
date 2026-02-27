export type NotificationType =
  | 'paiement'
  | 'demande'
  | 'alerte'
  | 'info'
  | 'commande'
  | 'stock'
  | 'promotion'
  | 'message';

export interface Notification {
  _id: string;
  titre: string;
  message: string;
  type: NotificationType;
  lien?: string | null;
  lu: boolean;
  destinataire_user?: string | null;
  destinataire_role?: string | null;
  global: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  titre: string;
  message: string;
  type?: NotificationType;
  lien?: string;
  destinataire_user?: string;
  destinataire_role?: string;
  global?: boolean;
}
