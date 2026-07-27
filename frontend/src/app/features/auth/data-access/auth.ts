import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { AuthenticatedUser, LoginCredentials, LoginResponseDto } from '../auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Service()
export class Auth {

    private readonly http = inject(HttpClient);

    login(credentials: LoginCredentials): Observable<LoginResponseDto> {
        return this.http.post<LoginResponseDto>(`${environment.apiUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
        })
    }

}
