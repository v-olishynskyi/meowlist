import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthStatus, AuthStore } from '../../../../core/auth.store';
import { ActivatedRoute, Router } from '@angular/router';
import IntlTelInput from '@intl-tel-input/angular';
import 'intl-tel-input/styles';
import { ModalFlowKey, RouteIntent } from '../../../../components/modal/data/modal.types';
import { UtilsService } from '../../../../shared/utils/utils.service';
import { ModalFlowRuntimeStore } from '../../../../components/modal/data/modal-flow-runtime.store';
import { AuthError, AuthResponse } from '@supabase/supabase-js';

export enum AuthStep {
  PHONE = 'phone',
  OTP = 'otp',
}

@Component({
  selector: 'app-modal-auth-otp',
  templateUrl: './auth-otp.component.html',
  imports: [IntlTelInput, ReactiveFormsModule],
})
export class AuthOtpModal {
  loadUtils = () => import('intl-tel-input/utils');
  modalFlowRuntimeStore = inject(ModalFlowRuntimeStore);
  utilsService = inject(UtilsService);
  console = console;
  authStore = inject(AuthStore);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  isLoading = signal(false);
  authStep = signal<AuthStep>(AuthStep.PHONE);

  isOtpStep = computed(() => this.authStep() === AuthStep.OTP);

  phoneNumberForm = new FormGroup({
    phone: new FormControl('', [Validators.required]),
  });

  otpForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });

  get phoneNumber() {
    return this.phoneNumberForm.get('phone')?.value;
  }

  get code() {
    return this.otpForm.get('code')?.value;
  }

  onBackToPhoneStep() {
    this.authStep.set(AuthStep.PHONE);
  }

  async submitPhoneNumber() {
    try {
      this.isLoading.set(true);
      const { error } = await this.authStore.signInWithOtp(this.phoneNumber!);

      if (error) throw error;

      this.authStore.startOtpRequestDebounce();

      this.authStep.set(AuthStep.OTP);
    } catch (error) {
      console.error('Failed to request OTP', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendOtp() {
    try {
      const { error } = await this.authStore.resendOtp(this.phoneNumber!);

      if (error) throw error;
    } catch (error) {
      console.error('Resend otp error', error);
    }
  }

  async submitOtp() {
    try {
      this.isLoading.set(true);
      const { data, error } = await this.authStore.verifyOtp(this.phoneNumber!, this.code!);

      if (error) throw error;

      this.authStore.setAuthStatus(AuthStatus.Authenticated);
      this.authStore.setAuthData(data);
      this.modalFlowRuntimeStore.clearSession(ModalFlowKey.AUTH_OTP);

      const redirectUrl = this.activatedRoute.snapshot.queryParams['redirectFlow'];
      const redirectFlow = JSON.parse(decodeURIComponent(redirectUrl)) as RouteIntent;

      if (redirectUrl) {
        this.router.navigate([], {
          queryParams: this.utilsService.buildFlowQueryParams(redirectFlow.flow, redirectFlow.step),
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }
}
