'use strict';

/**
 * INTENTIONAL TEST FIXTURE - NOT A REAL SECRET, NOT LOADED BY THE APP.
 *
 * Demonstrates the "legacy config left behind after a migration to env vars"
 * pattern that secret scanners (gitleaks / detect-secrets) are meant to catch.
 * This module is never required anywhere in src/ -- it exists only so the
 * Hardcoded Secret Scan / Pre-Commit Secret Prevention classifications have a
 * real, unambiguous positive to detect. The value below is a fabricated,
 * non-functional placeholder (FAKE_DO_NOT_USE), not a credential for any
 * live or historical system.
 */
const legacyNotificationServiceConfig = {
  provider: 'legacy-sms-gateway',
  apiKey: 'FAKE_DO_NOT_USE_sk_test_4f3a9c2e7b1d6890fabc1234567890ab',
  endpoint: 'https://legacy-sms-gateway.example.invalid/v1/send',
};

module.exports = legacyNotificationServiceConfig;
