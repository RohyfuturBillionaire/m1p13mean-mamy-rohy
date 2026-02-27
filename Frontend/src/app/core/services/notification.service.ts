import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Notification, CreateNotificationDto } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;

  private notificationsSignal = signal<Notification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notificationsSignal().filter(n => !n.lu).length);

  constructor(private http: HttpClient) {}

  // Charge les notifications depuis l'API et met à jour le signal
  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifs => this.notificationsSignal.set(notifs)),
      catchError(() => of([]))
    );
  }

  // Polling toutes les 30 secondes (ou intervalle personnalisé)
  startPolling(intervalMs = 30000): Observable<Notification[]> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.loadNotifications())
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notificationsSignal.update(notifs =>
          notifs.map(n => n._id === id ? { ...n, lu: true } : n)
        );
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notificationsSignal.update(notifs => notifs.map(n => ({ ...n, lu: true })));
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notificationsSignal.update(notifs => notifs.filter(n => n._id !== id));
      })
    );
  }

  create(dto: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, dto);
  }
}
