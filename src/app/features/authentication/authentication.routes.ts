import { Routes } from '@angular/router';
import { visitorsGuard } from 'src/app/core/guards/visitors/visitors.guard';
import { ERoutes } from 'src/app/shared/enums';

export const AUTHENTICATION_ROUTES: Routes = [
    {
        path: ERoutes.login,
        canActivate: [visitorsGuard],    
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    },
    {
        path: ERoutes.forgotPassword,
        loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
    },
    {
        path: ERoutes.resetPassword,
        loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
    },
    {
        path: ERoutes.register,
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
    },
    {
        path: ERoutes.verifyEmail,
        loadComponent: () => import('./pages/verify-email/verify-email').then((m) => m.VerifyEmail),
    },
    {
        path: ERoutes.verification,
        loadComponent: () => import('./pages/verification/verification').then((m) => m.Verification),
    },
    {
        path: ERoutes.unauthorizedInternalUser,
        loadComponent: () => import('./pages/un-authorized-internal-user/un-authorized-internal-user').then((m) => m.UnAuthorizedInternalUser),
    },
    {
        path: '',
        redirectTo: ERoutes.login,
        pathMatch: 'full',
    },
];
