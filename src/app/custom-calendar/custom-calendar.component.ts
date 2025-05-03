import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FilterRdvPipe } from '../filter-rdv.pipe';
import { OrderByDatePipe } from '../order-by-date.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule,FilterRdvPipe,OrderByDatePipe],
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.css']
})
export class CustomCalendarComponent implements OnInit {
  viewDate: Date = new Date();
  today: string = new Date().toDateString();
  weeks: (Date | null)[][] = [];
  selectedDate: Date | null = null;
  message: string = '';
  rendezvousList: any[] = [];
  popupDate: any ;  // Date + heure combinées pour confirmation
  heure: string = '';    
  searchTerm: string = '';
  popupMode: 'create' | 'view' = 'create';
  infoPopupVisible = false;
  infoMessage = '';
  ancienneDate: string = '';
  heureValide: boolean = true;

  daysInMonth: (Date | null)[] = [];  
  popupVisible = false;
  editPopupVisible = false;
  editRdvData = {
    _id: '',
    date: '',
    message: ''
  };
  
  // Spécialités et médecins
  specialites: string[] = [
    'Généraliste', 'Cardiologue', 'Dermatologue', 'Pédiatre',
    'Ophtalmologue', 'Psychiatre', 'Gynécologue', 'Neurologue',
    'Oncologue', 'Orthopédiste', 'Endocrinologue'
  ];
  selectedSpecialite: string = '';
  medecinsFiltres: any ;

  constructor(private http: HttpClient,private router: Router,private authService: AuthService
  ) {}
  
  heuresDisponibles: string[] = [];

  ngOnInit(): void {
    this.generateCalendar();
    this.loadMesRendezVous(); // <-- ici
    const heures = [];
  for (let h = 8; h <= 18; h++) {
    for (let m of [0, 15, 30, 45]) {
      const heureStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      heures.push(heureStr);
    }
  }
  this.heuresDisponibles = heures;
  }
  loadMesRendezVous(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clientId = user._id;
  
    this.authService.getMesRDV().subscribe({
      next: (data) => this.rendezvousList = data,
      error: (err) => console.error('Erreur lors du chargement des RDV', err)
    });
  }
  
  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  onDayClick(day: Date | null): void {
    if (!day) return;
  
    if (day.getDay() === 0) {
      alert("Les rendez-vous ne sont pas disponibles le dimanche.");
      return;
    }
  
    this.selectedDate = day;
    this.popupVisible = true;
  }
  
  fetchMedecins(): void {
    if (!this.selectedSpecialite) return;
    this.authService.getProfessionnelsBySpecialite(this.selectedSpecialite)
      .subscribe(data => this.medecinsFiltres = data);
  }
  editRdv(rdv: any) {
  

    const localDate = new Date(rdv.date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    
    this.editRdvData = {
      _id: rdv._id,
      date: `${year}-${month}-${day}T${hours}:${minutes}`,
      message: rdv.message
    };
  
    this.editPopupVisible = true;
  }
  
  submitEditRdv() {
    this.authService.updateRendezVous(this.editRdvData._id, {
      date: this.editRdvData.date,
      message: this.editRdvData.message
    }).subscribe({
      next: () => {
        this.editPopupVisible = false;
        this.loadMesRendezVous();
      },
      error: err => {
        console.error('Erreur lors de la modification du rendez-vous :', err);
        // Optionnel : afficher un message d’erreur à l’utilisateur
      }
    });
  }
  isHeureValide(heure: string): boolean {
    const [h, m] = heure.split(':').map(Number);
    return (
      h >= 8 &&
      h <= 18 &&
      [0, 15, 30, 45].includes(m)
    );
  }

  verifierHeure(dateTimeStr: string) {
    this.ancienneDate = dateTimeStr

    if (!dateTimeStr) {
      this.heureValide = false;
      return;
    }
  
    const dateObj = new Date(dateTimeStr);
    const heure = dateObj.toTimeString().slice(0, 5); // format "HH:mm"
  
    if (!this.isHeureValide(heure)) {
      alert("L'heure doit être entre 08:00 et 18:45");
      this.editRdvData.date = this.ancienneDate; // si tu veux remettre la date initiale
      this.heureValide = false;
    } else {
      this.heureValide = true;
    }
  }
  
  goHome() {
    this.router.navigate(['/home']);
  }
  deleteRdv(rdvId: string) {
    const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?");
    if (!confirmDelete) return;
    this.authService.deleteRendezVous(rdvId).subscribe({
      next: () => {
        this.rendezvousList = this.rendezvousList.filter(r => r._id !== rdvId);
        alert("Rendez-vous supprimé avec succès.");
      },
      error: (err) => {
        console.error(err);
        alert("Une erreur est survenue lors de la suppression.");
      }
    });
  }
  
  
  
  confirmRdv(medId: string): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const client = user._id;
  
    if (!this.selectedDate || !medId || !this.heure) return;
  
    // Fusionner la date et l'heure
    const [hours, minutes] = this.heure.split(':').map(Number);
    const dateWithTime = new Date(this.selectedDate);
    dateWithTime.setHours(hours);
    dateWithTime.setMinutes(minutes);
    dateWithTime.setSeconds(0);
    dateWithTime.setMilliseconds(0);
  
    const payload = {
      date: dateWithTime.toISOString(), // En format ISO pour le backend
      professionnel: medId,
      specialite: this.selectedSpecialite,
      message: this.message,
      client: client
    };
  
    this.authService.creerRendezVous(payload).subscribe(() => {
      alert('Rendez-vous créé');
      this.closePopup();
      this.heure = ""
      this.message = ""
      this.loadMesRendezVous();
    });
  }
  
  openPopup() {
    if (this.selectedDate && this.heure) {
      const [hours, minutes] = this.heure.split(':').map(Number);
      const dateWithTime = new Date(this.selectedDate);
      dateWithTime.setHours(hours, minutes);
      this.popupDate = dateWithTime;
      this.popupVisible = true;
    }
  }
  
  closePopup(): void {
    this.popupVisible = false;
    this.selectedSpecialite = '';
    this.medecinsFiltres = [];
  }
  generateCalendar() {
    const date = new Date(this.viewDate);
    date.setDate(1);
  
    const firstDay = date.getDay();
    const days: (Date | null)[] = [];
  
    // Remplir avec null pour les jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
  
    const currentMonth = date.getMonth();
    while (date.getMonth() === currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
  
    this.daysInMonth = days;
  }
  
  isToday(date: Date | null): boolean {
    return date?.toDateString() === new Date().toDateString();
  }
  
  isSelected(date: Date | null): boolean {
    return date?.getTime() === this.selectedDate?.getTime();
  }
  hasConfirmedRdv(date: Date): boolean {
    return this.rendezvousList.some(rdv => {
      const rdvDate = new Date(rdv.date);
      return rdv.statut === 'confirmé' &&
             rdvDate.getFullYear() === date.getFullYear() &&
             rdvDate.getMonth() === date.getMonth() &&
             rdvDate.getDate() === date.getDate();
    });
  }
  handleDayClick(day: Date | null) {
    if (!day || day.getDay() === 0 || day.getDay() === 6) return;
  
    const confirmedRdv = this.rendezvousList.find(r => {
      const rdvDate = new Date(r.date);
      return r.statut === 'confirmé' &&
        rdvDate.getDate() === day.getDate() &&
        rdvDate.getMonth() === day.getMonth() &&
        rdvDate.getFullYear() === day.getFullYear();
    });
  
    if (confirmedRdv) {
      this.selectedDate = new Date(confirmedRdv.date);
      const nomPro = confirmedRdv.professionnel?.nom || 'Médecin inconnu';
      const heure = this.formatHeure(confirmedRdv.date);
      const dateStr = this.selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  
      this.infoMessage = `Bonjour, vous avez un rendez-vous avec le docteur ${nomPro} à ${heure}, le ${dateStr}.`;
      this.infoPopupVisible = true;
  
      return;
    }
  
    this.onDayClick(day); // sinon, on laisse créer un rdv
  }
  
  
  
  // Format l’heure depuis une date (HH:mm)
  formatHeure(dateString: string): string {
    const d = new Date(dateString);
    return d.toTimeString().slice(0, 5); // "HH:mm"
  }
  
}
