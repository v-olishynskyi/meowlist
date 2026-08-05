import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Database } from '../database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabaseApiUrl,
      environment.supabasePublishableKey,
    );
  }
}
