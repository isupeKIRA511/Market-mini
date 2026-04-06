/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** `'true'` يعطّل حماية شاشة الدخول */
  readonly VITE_SKIP_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
