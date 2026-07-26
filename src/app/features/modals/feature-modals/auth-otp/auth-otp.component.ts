import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthStore } from '../../../../core/auth.store';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalBaseContainer } from '../../components/modal-container/modal-container.component';
import IntlTelInput from '@intl-tel-input/angular';
import 'intl-tel-input/styles';

export enum AuthStep {
  PHONE = 'phone',
  OTP = 'otp',
}

@Component({
  selector: 'app-modal-auth-otp',
  templateUrl: './auth-otp.component.html',
  imports: [ModalBaseContainer, IntlTelInput, ReactiveFormsModule],
})
export class AuthOtpModal {
  loadUtils = () => import('intl-tel-input/utils');
  console = console;
  authStore = inject(AuthStore);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

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

  submitPhoneNumber() {
    this.authStore
      .requestOtp(this.phoneNumber!)
      .subscribe({ next: () => this.authStep.set(AuthStep.OTP) });
  }

  resendOtp() {
    this.authStore.requestOtp(this.phoneNumber!).subscribe();
  }

  submitOtp() {
    this.authStore.signIn().subscribe({
      next: () => {
        // check if router statte has a redirect url, if so, navigate to that url, otherwise navigate to the home page
        const redirectUrl = this.activatedRoute.snapshot.queryParams['returnAction'];
        if (redirectUrl) {
          this.router.navigate([], {
            queryParams: { action: redirectUrl, returnAction: null },
            queryParamsHandling: 'merge',
            state: { closeModal: true },
            replaceUrl: true,
          });
        } else {
          this.router.navigate(['/']);
        }
      },
    });
  }
}
