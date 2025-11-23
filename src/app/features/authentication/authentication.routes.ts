import { Routes } from '@angular/router';
import { visitorsGuard } from 'src/app/core/guards/visitors/visitors.guard';

export const AUTHENTICATION_ROUTES: Routes = [
    {
        path: 'login',
        canActivate: [visitorsGuard],    
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./pages/verify-email/verify-email').then((m) => m.VerifyEmail),
    },
    {
        path: 'verification',
        loadComponent: () => import('./pages/verification/verification').then((m) => m.Verification),
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
];
