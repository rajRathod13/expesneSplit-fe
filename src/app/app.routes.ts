import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from 'guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { GroupDetailComponent } from './components/home/group-detail/group-detail.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { ExpenseComponent } from './components/home/group-detail/expense/expense.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  // Protected
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'invitation',
    component: InvitationComponent,
    canActivate: [authGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'groupDetail/:groupId',
    loadComponent: () =>
      import('./components/home/group-detail/group-detail.component').then(
        (m) => m.GroupDetailComponent
      ),
    canActivate: [authGuard],
  },
  // {
  //   path: 'expenseDetail/:expenseId',
  //   loadComponent: () =>
  //     import('./components/home/group-detail/expense/expense.component').then(
  //       (m) => m.ExpenseComponent
  //     ),
  //   canActivate: [authGuard],
  // },
  {
    path: 'expenseDetail',
    component: ExpenseComponent,
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'home' },
];
