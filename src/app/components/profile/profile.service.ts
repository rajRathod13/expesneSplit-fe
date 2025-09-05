import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private base = environment.apiBaseUrl;
  httpClient = inject(HttpClient);

  getUser(email: string) {
    return this.httpClient.get(
      `${this.base}/api/user/getUserByEmail?email=${email}`
    );
  }

  updateProfile(payload: {
    email: string;
    fullName: string;
    profilePicture?: File | null;
  }) {
    const fd = new FormData();
    fd.append('Email', payload.email);
    fd.append('fullName', payload.fullName);
    if (payload.profilePicture) {
      fd.append('profilePicture', payload.profilePicture);
    }

    return this.httpClient.put(`${this.base}/api/user/updateProfile`, fd, {
      withCredentials: true,
    });
  }
}
