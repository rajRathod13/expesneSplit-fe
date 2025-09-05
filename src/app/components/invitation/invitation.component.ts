import { Component, inject, OnInit } from '@angular/core';
import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.css',
})
export class InvitationComponent implements OnInit {
  pendingInvitations: Invitation[] = [];
  rejectedInvitations: Invitation[] = [];
  acceptedInvitations: Invitation[] = [];
  sentInvitations: Invitation[] = [];
  cancelledInvitations: Invitation[] = [];

  private invitationService = inject(InvitationService);
  private router = inject(Router);

  ngOnInit() {
    this.getpendingInvitations();
    this.getAcceptedInvitations();
    this.getsentInvitations();
    this.getRejectedInvitations();
    this.getCancelledInvitations();
  }

  acceptInvitation(payload: { invitationId: string }) {
    this.invitationService.acceptInvitation(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        // this.getpendingInvitations();
        this.pendingInvitations = this.pendingInvitations.filter(
          (invitation) => invitation.invitationId !== payload.invitationId
        );
        // this.router.navigate(['/home']);
      }
    });
  }

  rejectInvitation(payload: { invitationId: string }) {
    this.invitationService.rejectInvitation(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        this.pendingInvitations = this.pendingInvitations.filter(
          (invitation) => invitation.invitationId !== payload.invitationId
        );
      }
    });
  }

  cancelInvitaion(payload: { invitationId: string }) {
    this.invitationService.canceltInvitation(payload).subscribe((res: any) => {
      if (res.isSuccess) {
        let sentInvitation = this.sentInvitations.find(
          (invitation) => invitation.invitationId === payload.invitationId
        );
        if (sentInvitation) {
          this.cancelledInvitations.push(sentInvitation);
        }

        this.sentInvitations = this.sentInvitations.filter(
          (invitation) => invitation.invitationId !== payload.invitationId
        );
      }
    });
  }

  getpendingInvitations() {
    this.invitationService.getPendingInvitations().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.pendingInvitations = res.data;
      } else {
        console.log('No data found.');
      }
    });
  }

  getsentInvitations() {
    this.invitationService.getSentInvitations().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.sentInvitations = res.data;
      }
    });
  }

  getAcceptedInvitations() {
    this.invitationService.getAcceptedInvitations().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.acceptedInvitations = res.data;
      }
    });
  }

  getRejectedInvitations() {
    this.invitationService.getRejectedInvitations().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.rejectedInvitations = res.data;
      } else {
        console.log(res.message);
      }
    });
  }

  getCancelledInvitations() {
    this.invitationService.getCancelledInvitations().subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.cancelledInvitations = res.data;
      } else {
        console.log(res.message);
      }
    });
  }
}
