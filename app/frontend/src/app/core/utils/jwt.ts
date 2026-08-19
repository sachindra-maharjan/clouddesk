
/**
 * Decodes a JWT's payload without verifying its signature. This is safe
 * here because the token only ever came from our own backend (set right
 * after a successful login response) — we're reading claims to hydrate UI
 * state on page refresh, not trusting them for authorization. The backend
 * re-verifies the signature on every request via JwtAuthenticationFilter.
 */
export function decodeJwtPayload<T>(token: string): T | null {
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(normalized)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json) as T;
    } catch (error) {
        console.error('Failed to decode JWT payload:', error);
        return null;
    }
}