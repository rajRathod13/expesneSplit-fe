import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToasterService } from 'app/components/toast/toaster.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form!: FormGroup;

  submitting = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toaster: ToasterService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMsg = '';

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        // Cookie is set; refresh auth state and go home
        this.auth.checkAuth();
        this.toaster.success('Login successfully.', 'Success', 3000);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Login failed';
        this.submitting = false;
      },
    });
  }
}
