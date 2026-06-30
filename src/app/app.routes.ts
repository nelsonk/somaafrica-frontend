import { Routes } from '@angular/router';

import { HomeComponent } from './pre-login/home/home.component';
import { RegisterComponent } from './pre-login/register/register.component';
import { LoginComponent } from './pre-login/login/login.component';
import { authGuardGuard } from './guards/auth-guard.guard';
import { GroupSelectionComponent } from './pre-login/group-selection/group-selection.component';
import { groupGuard } from './guards/group.guard';
import { ForgotPasswordComponent } from './pre-login/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pre-login/reset-password/reset-password.component';
import { TeacherComponent } from './components/teacher/teacher/teacher.component';
import { ProfileLayoutComponent } from './commons/profile-layout/profile-layout.component';
import { DashboardComponent } from './commons/dashboard/dashboard.component';
import { LearningmaterialsComponent } from './components/academics/learningmaterials/learningmaterials.component';
import { QuizComponent } from './components/academics/quiz/quiz.component';

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
        path: 'profile',
        component: ProfileLayoutComponent,
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'teacher',
                component: TeacherComponent
            },
            {
                path: 'teacher/material',
                component: LearningmaterialsComponent
            },
            {
                path: 'teacher/quiz',
                component: QuizComponent
            }
        ],
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
