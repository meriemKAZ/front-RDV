import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-medecin',
  templateUrl: './login-medecin.component.html',
  imports: [ReactiveFormsModule,CommonModule],
  styleUrls: ['./login-medecin.component.css']
})
export class LoginMedecinComponent implements OnInit {
  authForm!: FormGroup;
  isLoginMode: boolean = true;
  submitted = false;
  specialites: string[] = [
    'Généraliste',
    'Cardiologue',
    'Dermatologue',
    'Pédiatre',
    'Ophtalmologue',
    'Psychiatre',
    'Gynécologue'
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
  }
  goHome() {
    this.router.navigate(['/home']);
  }
  initForm() {
    if (this.isLoginMode) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }else {
      this.authForm = this.fb.group({
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        specialite: ['Généraliste', Validators.required], // <- ajouté ici
        email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
    
  }
  

   toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.submitted = false;
    this.initForm(); // <- Réinitialise le formulaire en fonction du mode
  }
  

  onSubmit() {
    this.submitted = true;
 //   this.errorMessage = null; // Réinitialiser à chaque soumission
  
    console.log('Form state:', this.authForm.value);
  
    if (this.authForm.invalid) {
      console.log("Formulaire invalide");
      return;
    }
  
    const formValue = this.authForm.value;
  
    if (!this.isLoginMode && formValue.password !== formValue.confirmPassword) {
      this.authForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }
  
    const payload: any = {
      nom: formValue.nom + " " + formValue.prenom,
      email: formValue.email,
      motDePasse: formValue.password,
      role: 'professionnel'
    };
    
    if (!this.isLoginMode) {
      payload.specialite = formValue.specialite;
    }
    
  
    if (this.isLoginMode) {
      this.authService.login({ email: formValue.email, motDePasse: formValue.password }).subscribe({
        next: (res) => {
          console.log('Connexion réussie', res);
          localStorage.setItem('tokenPro', res?.token); // <-- token stocké
          localStorage.setItem('role', res?.user?.role); // <-- token stocké

          this.router.navigate(['/calendrierPro']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur de connexion';
         /// this.errorMessage = msg;
        }
      });
    } else {
      console.log("222")
      this.authService.register(payload).subscribe({
        next: (res) => {
          console.log('Inscription réussie', res);
          this.router.navigate(['/calendrier']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur lors de l\'inscription';
         // this.errorMessage = msg;
        }
      });
    }
  }
  


  get f() {
    return this.authForm.controls;
  }
}
