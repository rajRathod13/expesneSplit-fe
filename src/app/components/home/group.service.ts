import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private base = environment.apiBaseUrl;
  http = inject(HttpClient);

  addGroupDetail(payload: {
    title: string;
    categoryId: string;
    groupImageFile?: File | null;
  }) {
    const fd = new FormData();
    fd.append('Title', payload.title);
    fd.append('CategoryId', payload.categoryId);
    if (payload.groupImageFile) {
      fd.append('GroupImageFile', payload.groupImageFile);
    }
    return this.http.post(`${this.base}/api/groupDetail/creategroup`, fd, {
      withCredentials: true,
    });
  }

  getGroupsByUserId() {
    return this.http.get(`${this.base}/api/groupDetail/getGroupDetailByUserId`);
  }

  getGroupDetailById(id?: string) {
    return this.http.get(
      `${this.base}/api/groupDetail/getGroupDetailById?groupId=${id}`
    );
  }

  getUsersByGroupId(groupId?: string) {
    return this.http.get(
      `${this.base}/api/groupDetail/GetGroupUsers?groupId=${groupId}`
    );
  }
}
