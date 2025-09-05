import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private base = environment.apiBaseUrl;
  http = inject(HttpClient);

  getUnInvitedUsers(groupId: string) {
    return this.http.get(
      `${this.base}/api/user/getuninvitedusers?groupId=${groupId}`
    );
  }

  removeMemberFromGroup(payload: { userId: string; groupId: string }) {
    return this.http.post(
      `${this.base}/api/usergroup/removeuserfromgroup`,
      payload,
      { withCredentials: true }
    );
  }
}
