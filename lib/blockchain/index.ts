/**
 * Blockchain Integration Module
 * Exports all blockchain-related functions and constants
 */

// Constants
export {
  REGISTRY_ADDRESS,
  ANNOUNCEMENT_ADDRESS,
  BASE_CHAIN_ID,
  REGISTRY_ABI,
  ANNOUNCEMENT_ABI,
} from "@/lib/constants";

// Stealth Address Functions
export {
  generateStealthKeys,
  generateStealthAddress,
  computeStealthAddress,
  isValidStealthAddress,
  type StealthKeys,
  type StealthAddressResult,
} from "./stealth";

// Registry Functions
export {
  checkUsernameAvailability,
  getViewingKey,
  getUsername,
  getAddress,
  registerUsername,
  listenForRegistrations,
} from "./registry";

// Scanner Functions
export {
  scanForIncomingTransfers,
  parseMetadata,
  announceStealthAddress,
  getAnnouncementsForAddress,
  type AnnouncementEvent,
  type ParsedMetadata,
} from "./scanner";

// Announcement Functions
export {
  announceStealthTransaction,
  listenForAnnouncements,
} from "./announcement";

// Meta Keys (Deterministic Key Derivation)
export { deriveMetaKeys, type MetaKeys } from "./meta-keys";

// Recovery Functions
export { recoverMetaKeys } from "./recovery";
