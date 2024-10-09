import { Routes } from '@angular/router';

import { HomeComponent } from './pre-login/home/home.component';
import { RegisterComponent } from './pre-login/register/register.component';
import { LoginComponent } from './pre-login/login/login.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { authGuardGuard } from './guards/auth-guard.guard';

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
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'user/profile',
        component: ProfileComponent,
        canActivate: [authGuardGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
