import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './login-client.component.html',
  styleUrls: ['./login-client.component.css']
})
export class LoginClientComponent implements OnInit {
  authForm!: FormGroup;
  isLoginMode: boolean = true;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    if (!this.isLoginMode) {
      this.authForm.addControl('nom', this.fb.control('', Validators.required));
      this.authForm.addControl('prenom', this.fb.control('', Validators.required));
      this.authForm.addControl('dateNaissance', this.fb.control('', Validators.required));
      this.authForm.addControl('confirmPassword', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }
  goHome() {
    this.router.navigate(['/home']);
  }
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.submitted = false;
    this.initForm(); // <-- Recrée le formulaire selon le mode
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null; // Réinitialiser à chaque soumission
  
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
  
    const payload = {
      nom: formValue.nom + " " +formValue.prenom,
      email: formValue.email,
      motDePasse: formValue.password,
      role: 'client'
    };
  
    if (this.isLoginMode) {
      this.authService.login({ email: formValue.email, motDePasse: formValue.password }).subscribe({
        next: (res) => {
          console.log('Connexion réussie', res);
          localStorage.setItem('tokenClient', res?.token); // <-- token stocké
          localStorage.setItem('role', res?.user?.role); // <-- token stocké
          localStorage.setItem('user', JSON.stringify(res?.user));

          this.router.navigate(['/calendrierClient']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur de connexion';
          this.errorMessage = msg;
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
          this.errorMessage = msg;
        }
      });
    }
  }
  

  get f() {
    return this.authForm.controls;
  }
}
