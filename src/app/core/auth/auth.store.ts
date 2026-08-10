import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, interval, of, take, tap, timer } from 'rxjs';
import { ModalFlowRuntimeStore } from '../modal/modal-flow-runtime.store';
import { AuthApi } from './auth.api';
import { AuthChangeEvent, AuthResponse, Session, Subscription } from '@supabase/supabase-js';
import { GiftReservation, Profile } from '../types';
import { isPlatformBrowser } from '@angular/common';

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
  private readonly platformId = inject(PLATFORM_ID);

  private authApi = inject(AuthApi);
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);

  private authSubscription: Subscription | null = null;

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

  private authEventQueue = Promise.resolve();

  checkAuth() {
    // If the platform is not a browser, we don't want to set up the auth changes listener
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const { data } = this.authApi.authChanges(async (event, session) => {
      this.authEventQueue = this.authEventQueue
        .then(() => this.handleAuthChange(event, session))
        .catch((error) => {
          console.error('Error handling auth change:', error);
        });
    });

    this.authSubscription = data.subscription;
  }

  private async handleAuthChange(event: AuthChangeEvent, session: Session | null) {
    switch (event) {
      case 'INITIAL_SESSION': {
        try {
          if (session) {
            await this.setAuthenticatedSession(session);
          } else {
            this.clearAuthState();
          }
        } catch (error) {
          console.error('Error handling INITIAL_SESSION event:', error);
        }
        break;
      }
      case 'SIGNED_IN': {
        if (!session) {
          break;
        }

        await this.setAuthenticatedSession(session);
        break;
      }
      case 'SIGNED_OUT': {
        this.clearAuthState();
        break;
      }
      case 'TOKEN_REFRESHED': {
        if (!session) {
          break;
        }

        this.setAuthData({ session, user: session.user });

        break;
      }
    }
  }

  private async setAuthenticatedSession(session: Session) {
    const user = session.user;

    this.setAuthData({ session, user });

    if (this.profile()?.id !== user.id) {
      await this.loadProfile(user.id);
    }

    this.setAuthStatus(AuthStatus.Authenticated);
  }

  private clearAuthState() {
    this.setAuthData(null);
    this.setAuthStatus(AuthStatus.Unauthenticated);
    this._profileSubject.next(null);
  }

  loadProfile(userId?: string) {
    const profileId = userId ?? this.currentUser()?.id ?? null;
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

  addReservation(reservation: GiftReservation) {
    // TODO
    const updatedProfile: Profile = {
      ...this.profile()!,
      reservations: [...(this.profile()?.reservations || []), reservation],
    };
    this._profileSubject.next(updatedProfile);
  }

  removeReservation(giftId: string) {
    // TODO
    const updatedProfile: Profile = {
      ...this.profile()!,
      reservations: (this.profile()?.reservations || []).filter(
        (reservation) => reservation.gift_id !== giftId,
      ),
    };
    this._profileSubject.next(updatedProfile);
  }
}
