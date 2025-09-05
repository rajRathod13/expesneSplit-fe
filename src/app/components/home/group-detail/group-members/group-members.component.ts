import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { environment } from '@env/environment';
import { AppUser } from 'app/components/auth/auth.models';
import { AuthService } from 'app/components/auth/auth.service';
import { GroupDetail } from '../group-detail.models';

@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-members.component.html',
  styleUrl: './group-members.component.css',
})
export class GroupMembersComponent implements OnInit {
  base = environment.apiBaseUrl;
  appUsers: AppUser | null = null;
  isAdmin: boolean = true;
  authService = inject(AuthService);
  @Input() groupMembers: AppUser[] = [];
  @Input({ required: true }) groupDetail!: GroupDetail;
  @Input({ required: true }) isMember: boolean = false;
  @Output() removeUser = new EventEmitter<{
    userId: string;
    groupId: string;
  }>();
  currentUserId: string | null = null;

  ngOnInit(): void {
    const user = this.authService.loadUser(); // your existing method
    this.currentUserId = user?.id ?? null; // pick the right field
    console.log(this.isMember);
  }

  onRemove(member: any) {
    this.removeUser.emit({
      userId: member.userId,
      groupId: this.groupDetail.groupId,
    });
  }

  trackByUserId = (_: number, m: any) => m.userId;
}
