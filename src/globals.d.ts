declare module '*.css';
declare module '@fontsource/*' {}
declare module '@fontsource-variable/*' {}

declare interface Env {
  readonly NG_APP_SUPABASE_API_URL: string;
  readonly NG_APP_SUPABASE_PUBLISHABLE_KEY: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
