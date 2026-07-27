
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthenticatedUser, AuthRole, LoginCredentials, LoginResponseDto } from './../auth.model';
import { computed, inject } from '@angular/core';
import { TokenStorage } from '../../../core/services/token-storage';
import { decodeJwtPayload } from '../../../core/utils/jwt';
import { Auth } from './auth';
import { Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

interface JwtClaims {
    sub: string;
    userId: string;
    displayName: string;
    role: AuthRole;
    exp: number;
}

interface AuthState {
    user: AuthenticatedUser | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
}

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ user }) => ({
        isAuthenticated: computed(() => !!user()),
        isAdmin: computed(() => user()?.role === 'ADMIN'),
        displayName: computed(() => user()?.displayName ?? ''),
    })),
    withMethods((store, authService = inject(Auth), tokenStorage = inject(TokenStorage), router = inject(Router)) => ({
        login: rxMethod<LoginCredentials>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap((credential) => {
                    return authService.login(credential)
                        .pipe(
                            tapResponse({
                                next: (response: LoginResponseDto) => {
                                    tokenStorage.set(response.token);
                                    patchState(store, {
                                        user: response.user,
                                        isLoading: false,
                                    });
                                    router.navigateByUrl('/home');
                                },
                                error: () => {
                                    patchState(store, {
                                        isLoading: false,
                                        error: "Invalid email or password."
                                    })
                                }

                            })
                        )
                })
            )),
        logout(): void {
            tokenStorage.clear();
            patchState(store, { user: null });
            router.navigateByUrl('/login');
        }
    })),
    withHooks({
        onInit(store) {
            console.log('AuthStore initialized');

            const tokenStorage = inject(TokenStorage);
            const token = tokenStorage.get();

            if (!token) return

            const claims = decodeJwtPayload<JwtClaims>(token);
            const expired = !claims || claims.exp * 1000 < Date.now();

            if (expired) {
                tokenStorage.clear();
                return;
            }

            patchState(store, {
                user: {
                    id: claims.userId,
                    email: claims.sub,
                    displayName: claims.displayName,
                    role: claims.role,
                }
            });
        },

    })
);
