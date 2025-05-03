import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mes-rendezvous',
  imports: [],
  templateUrl: './mes-rendezvous.component.html',
  styleUrl: './mes-rendezvous.component.css'
})
export class MesRendezvousComponent {
  rendezvousList: any[] = [];
  selectedDate: string | null = null;
  selectedInfo: any[] = [];
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

   
  }

  hasRendezVous(date: string): boolean {
    return this.rendezvousList.some(rv => rv.date.startsWith(date));
  }

  openPopup(date: string): void {
    this.selectedDate = date;
    this.selectedInfo = this.rendezvousList.filter(rv => rv.date.startsWith(date));
  }

  closePopup(): void {
    this.selectedDate = null;
  }
}


