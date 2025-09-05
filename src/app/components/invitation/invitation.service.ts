import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  base = environment.apiBaseUrl;
  http = inject(HttpClient);

  sendInvitation(payload: { groupId: string; invitedUserId: string }) {
    return this.http.post(
      `${this.base}/api/invitation/sendinvitation`,
      payload,
      { withCredentials: true }
    );
  }

  acceptInvitation(payload: { invitationId: string }) {
    return this.http.post(
      `${this.base}/api/invitation/acceptinvitation`,
      payload,
      { withCredentials: true }
    );
  }

  canceltInvitation(payload: { invitationId: string }) {
    return this.http.post(
      `${this.base}/api/invitation/cancelinvitation`,
      payload,
      { withCredentials: true }
    );
  }

  rejectInvitation(payload: { invitationId: string }) {
    return this.http.post(
      `${this.base}/api/invitation/rejectinvitation`,
      payload,
      { withCredentials: true }
    );
  }

  getPendingInvitations() {
    return this.http.get(`${this.base}/api/invitation/getpendinginvitations`, {
      withCredentials: true,
    });
  }

  getSentInvitations() {
    return this.http.get(`${this.base}/api/invitation/getsentinvitations`, {
      withCredentials: true,
    });
  }

  getAcceptedInvitations() {
    return this.http.get(`${this.base}/api/invitation/getacceptedinvitations`, {
      withCredentials: true,
    });
  }

  getRejectedInvitations() {
    return this.http.get(`${this.base}/api/invitation/getrejectedinvitations`, {
      withCredentials: true,
    });
  }

  getCancelledInvitations() {
    return this.http.get(
      `${this.base}/api/invitation/getcancelledinvitations`,
      {
        withCredentials: true,
      }
    );
  }
}
