// Augment the NodeJS namespace to provide type safety for environment variables.
// This is required for accessing process.env.API_KEY when initializing the Gemini API.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
