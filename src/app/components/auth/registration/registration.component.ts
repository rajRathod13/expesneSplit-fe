import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  form!: FormGroup;

  submitting = false;
  errorMsg = '';
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // …then initialize AFTER fb is injected
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      profilePictureFile: [null as File | null],
    });
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.form.patchValue({ profilePictureFile: file });

    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMsg = '';

    const v = this.form.value;
    this.auth
      .register({
        fullName: v.fullName!,
        email: v.email!,
        phoneNumber: v.phoneNumber!,
        password: v.password!,
        profilePictureFile: v.profilePictureFile || undefined,
      })
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Registration failed';
          this.submitting = false;
        },
      });
  }
}
