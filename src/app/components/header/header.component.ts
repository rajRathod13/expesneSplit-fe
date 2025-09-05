import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { AppUser } from '../auth/auth.models';
import { environment } from '@env/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  base = environment.apiBaseUrl;
  isMenuOpen = false;
  user$!: Observable<AppUser | null>;
  constructor(public auth: AuthService, private router: Router) {
    this.user$ = this.auth.user$;
    this.router.events.subscribe(() => (this.isMenuOpen = false));
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  closeMenu() {
    this.isMenuOpen = false;
  }

  doLogout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.checkAuth(); // will flip to false
        this.router.navigate(['/login']);
      },
      error: () => {
        // even if error, go to login
        this.auth.checkAuth();
        this.router.navigate(['/login']);
      },
    });
  }
}
