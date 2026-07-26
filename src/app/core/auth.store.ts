import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';

export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
  Loading = 'loading',
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly _authStatusSubject$ = new BehaviorSubject<AuthStatus>(AuthStatus.Loading);
  private readonly _authStatus$ = this._authStatusSubject$.asObservable();
  private readonly authStatus = toSignal(this._authStatus$, { initialValue: AuthStatus.Loading });

  readonly isAuthenticated = computed(() => this.authStatus() === AuthStatus.Authenticated);
  readonly isLoading = computed(() => this.authStatus() === AuthStatus.Loading);
  readonly isUnauthenticated = computed(() => this.authStatus() === AuthStatus.Unauthenticated);

  setAuthStatus(status: AuthStatus) {
    this._authStatusSubject$.next(status);
  }

  checkAuth() {
    this.setAuthStatus(AuthStatus.Loading);

    return of(false).pipe(
      tap((response) => {
        if (!response) {
          throw new Error('User is not authenticated');
        }

        this.setAuthStatus(AuthStatus.Authenticated);
        return of(null);
      }),
      catchError(() => {
        this.setAuthStatus(AuthStatus.Unauthenticated);
        return of(null);
      }),
    );
  }

  signIn() {
    return of(null).pipe(tap(() => this.setAuthStatus(AuthStatus.Authenticated)));
  }
}
