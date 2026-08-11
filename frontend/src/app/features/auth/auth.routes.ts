import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./ui/login-page/login-page').then(m => m.LoginPage)
    }
];
