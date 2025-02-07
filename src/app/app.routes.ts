import { Routes } from '@angular/router';

import { HomeComponent } from './pre-login/home/home.component';
import { RegisterComponent } from './pre-login/register/register.component';
import { LoginComponent } from './pre-login/login/login.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { authGuardGuard } from './guards/auth-guard.guard';
import { GroupSelectionComponent } from './pre-login/group-selection/group-selection.component';
import { groupGuard } from './guards/group.guard';
import { ForgotPasswordComponent } from './pre-login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'group',
        component: GroupSelectionComponent,
        canActivate: [authGuardGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'user/profile',
        component: ProfileComponent,
        canActivate: [authGuardGuard, groupGuard]
    },
    {
        path: 'forgot_password',
        component: ForgotPasswordComponent
    },
    {
        path: 'password_reset/:guid/:token',
        component: ResetPasswordComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];
