import { Injectable } from '@angular/core';

/**
 * Storage for JWT token.
 * Using local storage for simplicity. For production, consider using HttpOnly cookies.
 */

const TOKEN_KEY = "clouddesk.auth.token";

@Injectable({ providedIn: 'root' })
export class TokenStorage {
    get(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    set(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    }

    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
    }
}
