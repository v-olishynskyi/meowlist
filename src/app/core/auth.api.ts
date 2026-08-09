import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  supabase = inject(SupabaseService).supabase;

  loadProfile(profileId: string) {
    return this.supabase.from('profiles').select('*').eq('id', profileId).single();
  }

  signInWithOtp(phoneNumber: string) {
    return this.supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: { shouldCreateUser: true, data: { phone_number: phoneNumber }, channel: 'sms' },
    });
  }

  verifyOtp(phoneNumber: string, code: string) {
    return this.supabase.auth.verifyOtp({ phone: phoneNumber, token: code, type: 'sms' });
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  resendCode(phoneNumber: string) {
    return this.supabase.auth.resend({ phone: phoneNumber, type: 'sms' });
  }

  logout() {
    return this.supabase.auth.signOut();
  }
}
