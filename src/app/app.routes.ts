import { Routes } from '@angular/router';
import { LoginClientComponent } from './pages/login-client/login-client.component';
import { LoginMedecinComponent } from './pages/login-medecin/login-medecin.component';
import { HomeComponent } from './pages/home/home.component';
import { CustomCalendarComponent } from './custom-calendar/custom-calendar.component';
import { MedecinCalendarComponent } from './calendrier-medecin/calendrier-medecin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login-client', component: LoginClientComponent },
  { path: 'login-medecin', component: LoginMedecinComponent },
  { path: 'calendrierClient', component: CustomCalendarComponent },
  { path: 'calendrierPro', component: MedecinCalendarComponent },
  { path: 'home', component: HomeComponent }

  ];

