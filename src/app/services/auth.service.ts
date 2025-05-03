import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth'; // <-- à adapter à ton serveur

  constructor(private http: HttpClient) {}

  login(data: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/auth/login', data);
  }
  creerRendezVous(data: any) {
    const token = localStorage.getItem('tokenClient');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>('http://localhost:3000/api/rendezvous', data, { headers });
  }
  
  getProfessionnelsBySpecialite(specialite: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/professionnels?specialite=${encodeURIComponent(specialite)}`);
  }
  
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }
  getMesRDV(): Observable<any[]> {
    const token = localStorage.getItem('tokenClient');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>('http://localhost:3000/api/rendezvous/mine', { headers });
  }
  
  getRendezVousDuClient(clientId: string) {
    return this.http.get<any[]>(`http://localhost:3000/api/rendezvous/mine/${clientId}`);
  }
  updateRendezVous(rdvId: string, data: any): Observable<any> {
    const token = localStorage.getItem('tokenClient');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`http://localhost:3000/api/rendezvous/${rdvId}`, data, { headers });
  }
  deleteRendezVous(rdvId: string): Observable<any> {
    const token = localStorage.getItem('tokenClient');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`http://localhost:3000/api/rendezvous/${rdvId}`, { headers });
  }
  getMedecinRendezVous(): Observable<any[]> {
    const token = localStorage.getItem('tokenPro');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>('http://localhost:3000/api/rendezvous/pro', { headers });
  }
  mettreAJourStatutRdv(id: string, statut: 'confirmé' | 'annulé'): Observable<any> {
    const token = localStorage.getItem('tokenPro');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`http://localhost:3000/api/rendezvous/${id}/statut`, { statut }, { headers });
  }
  
}
