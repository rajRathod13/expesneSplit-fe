import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '@env/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  base = environment.apiBaseUrl;
  selectedProfilePicture: File | null = null;
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  user = {
    id: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    profilePicture: '',
  };
  isModalOpen = false;
  profileData = {
    id: '',
    fullName: '',
    profilePicture: '',
  };

  ngOnInit() {
    this.getUserByEmail();
  }

  getUserByEmail() {
    let storeuser = localStorage.getItem('app_user');
    let user = storeuser ? JSON.parse(storeuser) : undefined;
    let email = user ? user.email : '';
    this.profileService.getUser(email).subscribe((res: any) => {
      if (res.isSuccess) {
        this.user = res.data;
        this.user.profilePicture = `${this.base}/${this.user.profilePicture}`;
        this.profileData = { ...res.data };
      }
    });
  }

  updateProfile(formData: any) {
    const payload = {
      email: formData.email,
      fullName: formData.fullName,
      profilePicture: this.selectedProfilePicture, // Send file if exists
    };

    this.profileService.updateProfile(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        this.user = res.data;
        this.user.profilePicture = `${this.base}/${this.user.profilePicture}`;
        this.authService.setUser(res.data, { cacheBust: true });
        this.closeModal();
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  onProfilePictureChange(event: any) {
    this.selectedProfilePicture = event.target.files[0];
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
  }
}
