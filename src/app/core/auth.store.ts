import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, interval, of, take, tap, timer } from 'rxjs';
import { ModalFlowRuntimeStore } from '../components/modal/data/modal-flow-runtime.store';
import { AuthApi } from './auth.api';
import { AuthResponse } from '@supabase/supabase-js';
import { Profile } from './types';
import { WishlistStore } from '../features/modals/feature-modals/data/wishlist.store';

export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
  Loading = 'loading',
}

type AuthData = AuthResponse['data'];

const OTP_REQUEST_DEBOUNCE_TIME = 60; // seconds

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private authApi = inject(AuthApi);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  private readonly _authDataSubject = new BehaviorSubject<AuthData | null>(null);
  readonly _authData$ = this._authDataSubject.asObservable();
  readonly authData = toSignal(this._authData$, { initialValue: null });

  private readonly _authStatusSubject = new BehaviorSubject<AuthStatus>(AuthStatus.Loading);
  readonly _authStatus$ = this._authStatusSubject.asObservable();
  readonly authStatus = toSignal(this._authStatus$, { initialValue: AuthStatus.Loading });

  readonly isAuthenticated = computed(() => this.authStatus() === AuthStatus.Authenticated);
  readonly isLoading = computed(() => this.authStatus() === AuthStatus.Loading);
  readonly isUnauthenticated = computed(() => this.authStatus() === AuthStatus.Unauthenticated);

  private readonly _profileSubject = new BehaviorSubject<Profile | null>(null);
  readonly _profile$ = this._profileSubject.asObservable();
  readonly profile = toSignal(this._profile$, { initialValue: null });

  readonly otpRequestDebounce = signal<number>(OTP_REQUEST_DEBOUNCE_TIME);
  readonly isOtpRequestAvailable = computed(
    () => this.otpRequestDebounce() === OTP_REQUEST_DEBOUNCE_TIME,
  );

  readonly currentUser = computed(() => this.authData()?.user ?? null);
  readonly currentSession = computed(() => this.authData()?.session ?? null);

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
    this._authStatusSubject.next(status);
  }

  setAuthData(data: AuthData | null) {
    this._authDataSubject.next(data);
  }

  checkAuth() {
    this.authApi.authChanges(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.loadProfile();
        this.setAuthStatus(AuthStatus.Authenticated);
        this.setAuthData({ session, user: session.user });
      } else if (event === 'SIGNED_OUT') {
        this.setAuthStatus(AuthStatus.Unauthenticated);
        this.setAuthData(null);
        this._profileSubject.next(null);
      }
    });
  }

  loadProfile() {
    const profileId = this.currentUser()?.id ?? null;
    if (!profileId) return null;

    return this.authApi.loadProfile(profileId).then(
      (data) => {
        this._profileSubject.next(data.data);
      },
      (error) => {
        console.error('Failed to fetch profile', error);
      },
    );
  }

  signInWithOtp(phoneNumber: string) {
    return this.authApi.signInWithOtp(phoneNumber);
  }

  verifyOtp(phoneNumber: string, code: string) {
    return this.authApi.verifyOtp(phoneNumber, code);
  }

  async resendOtp(phoneNumber: string) {
    const response = await this.authApi.resendCode(phoneNumber);
    this.startOtpRequestDebounce();
    return response;
  }

  async logout() {
    const response = await this.authApi.logout();
    this.setAuthStatus(AuthStatus.Unauthenticated);
    this.setAuthData(null);

    return response;
  }
}
