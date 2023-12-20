/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />


interface ImportMetaEnv {
    readonly MODE: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }