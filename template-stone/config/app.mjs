import { Env } from "@stone-js/env";

export const app = {
  /**
   * App environnement(production, staging, developement, local)
   */
  env: Env.string('APP_ENV', 'local'),

  /**
   * Debug mode
   */
  debug: Env.boolean('APP_DEBUG', false),

  /**
   * Current app locale
   */
  locale: Env.string('APP_LOCALE', 'en'),
  
  /**
   * Fallback locale
   */
  fallbackLocale: Env.string('APP_FALLBACK_LOCALE', 'en'),
}