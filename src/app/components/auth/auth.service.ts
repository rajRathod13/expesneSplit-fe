import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AppUser, LoginResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;
  private userSubject = new BehaviorSubject<AppUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();
  // Auth state
  isAuthenticated = signal<boolean>(false);
  loading = signal<boolean>(true);

  constructor(private http: HttpClient, private router: Router) {
    // Check session on app start/refresh
    this.checkAuth();
  }

  /** Registration using multipart/form-data to match your DTO */
  register(payload: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    profilePictureFile?: File | null;
  }) {
    const fd = new FormData();
    fd.append('FullName', payload.fullName);
    fd.append('Email', payload.email);
    fd.append('PhoneNumber', payload.phoneNumber);
    fd.append('Password', payload.password);
    if (payload.profilePictureFile) {
      fd.append('ProfilePictureImage', payload.profilePictureFile);
    }
    // No credentials for register
    return this.http.post(`${this.base}/api/auth/register`, fd, {
      withCredentials: false,
    });
  }

  login(payload: {
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/api/auth/login`, payload)
      .pipe(
        tap((res) => {
          console.log(res);
          res.data.profilePicture = `${this.base}/${res.data.profilePicture}`;
          this.setUser(res.data);
        })
      );
  }

  logout() {
    this.clearUser();
    return this.http.post(
      `${this.base}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  /** Ping any [Authorize] endpoint to confirm cookie session */
  checkAuth(): void {
    const cached = this.loadUser();
    this.userSubject.next(cached);

    this.loading.set(true);
    this.http
      .get(`${this.base}${environment.authPingPath}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.isAuthenticated.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.isAuthenticated.set(false);
          this.loading.set(false);
        },
      });
  }

  /** Guard helper – resolves when loading completes and returns current auth */
  ensureAuth(): Promise<boolean> {
    if (!this.loading()) return Promise.resolve(this.isAuthenticated());

    return new Promise<boolean>((resolve) => {
      const tick = () => {
        if (this.loading()) {
          setTimeout(tick, 30);
          return;
        }
        resolve(this.isAuthenticated());
      };
      tick();
    });
  }

  private setUser(user: AppUser | null) {
    this.userSubject.next(user);
    if (user) localStorage.setItem('app_user', JSON.stringify(user));
    else localStorage.removeItem('app_user');
  }

  loadUser(): AppUser | null {
    const raw = localStorage.getItem('app_user');
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }

  private clearUser() {
    this.setUser(null);
  }
}
