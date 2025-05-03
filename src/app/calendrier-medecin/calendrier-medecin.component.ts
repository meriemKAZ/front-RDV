import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterRdvPipe } from '../filter-rdv.pipe';
import { Router } from '@angular/router';
@Component({
  selector: 'app-medecin-calendar',
  templateUrl: './calendrier-medecin.component.html',
  imports: [CommonModule],
  styleUrls: ['./calendrier-medecin.component.css']
})
export class MedecinCalendarComponent implements OnInit {
  viewDate: Date = new Date();
  selectedDate: Date = new Date();
  today: string = new Date().toDateString();
  days: string[] = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  daysInMonth: (Date | null)[] = [];

  rendezvousList: any[] = [];
  filteredRdvList: any[] = [];
  constructor(
    private authService: AuthService,private router: Router,

  ) {}
  ngOnInit(): void {
    this.generateCalendar();
    this.fetchRendezvous();
  }

  generateCalendar(): void {
    this.daysInMonth = [];
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      this.daysInMonth.push(null);
    }

    for (let d = 1; d <= lastDay?.getDate(); d++) {
      this.daysInMonth.push(new Date(year, month, d));
    }

    this.filterRdvByDate();
  }
  goHome() {
    this.router.navigate(['/home']);
  }
  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.filterRdvByDate();
  }

  isToday(date: Date | null): boolean {
    return date?.toDateString() === this.today;
  }

  isSelected(date: Date | null): boolean {
    return date?.toDateString() === this.selectedDate?.toDateString();
  }

  hasRdv(date: Date | null): boolean {
    if (!date) return false;
    return this.rendezvousList.some(rdv =>
      new Date(rdv.date).toDateString() === date.toDateString()
    );
  }

  filterRdvByDate(): void {
    this.filteredRdvList = this.rendezvousList.filter(rdv =>
      new Date(rdv.date).toDateString() === this.selectedDate.toDateString()
    );
  }

  fetchRendezvous(): void {
    this.authService.getMedecinRendezVous().subscribe({
      next: (data) => {
        this.rendezvousList = data;
        this.filterRdvByDate();
      },
      error: (err) => {
        console.error('Erreur de chargement des rendez-vous:', err);
      }
    });
  }
  confirmerRdv(id: string): void {
    this.authService.mettreAJourStatutRdv(id, 'confirmé').subscribe({
      next: () => {
        const rdv = this.rendezvousList.find(r => r._id === id);
        if (rdv) rdv.statut = 'confirmé';
        this.filterRdvByDate();
      },
      error: err => {
        console.error("Erreur lors de la confirmation :", err);
      }
    });
  }
  
  annulerRdv(id: string): void {
    this.authService.mettreAJourStatutRdv(id, 'annulé').subscribe({
      next: () => {
        this.rendezvousList = this.rendezvousList.filter(r => r._id !== id);
        this.filterRdvByDate();
      },
      error: err => {
        console.error("Erreur lors de l'annulation :", err);
      }
    });
  }
  
}

  
