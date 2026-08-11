import { Routes } from "@angular/router";

export const FILES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./ui/file-page/file-page').then(m => m.FilePage)
    }
]