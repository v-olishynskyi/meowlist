import { computed, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, interval, of, take, tap, timer } from 'rxjs';

export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
  Loading = 'loading',
}

const OTP_REQUEST_DEBOUNCE_TIME = 60; // seconds

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

  readonly otpRequestDebounce = signal<number>(OTP_REQUEST_DEBOUNCE_TIME);
  readonly isOtpRequestAvailable = computed(
    () => this.otpRequestDebounce() === OTP_REQUEST_DEBOUNCE_TIME,
  );

  resetOtpRequestDebounce() {
    this.otpRequestDebounce.set(OTP_REQUEST_DEBOUNCE_TIME);
  }

  startOtpRequestDebounce() {
    return timer(0, 1000)
      .pipe(
        take(OTP_REQUEST_DEBOUNCE_TIME),
        tap(() => this.otpRequestDebounce.update((value) => value - 1)),
      )
      .subscribe({
        complete: () => {
          this.resetOtpRequestDebounce();
        },
      });
  }

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

  requestOtp(phoneNumber: string) {
    return of(null).pipe(
      tap(() => {
        console.log('Requesting OTP for phone number:', phoneNumber);
        this.startOtpRequestDebounce();
      }),
    );
  }

  signIn() {
    return of(null).pipe(tap(() => this.setAuthStatus(AuthStatus.Authenticated)));
  }
}
