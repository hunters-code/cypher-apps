import { ethers } from "ethers";

const PIN_HASH_KEY = "cypher_pin_hash";
const PIN_LOCKOUT_KEY = "cypher_pin_lockout";
const PIN_ATTEMPTS_KEY = "cypher_pin_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export interface PINValidationResult {
  valid: boolean;
  error?: string;
}

export interface PINLockoutStatus {
  locked: boolean;
  remainingTime?: number;
}

export function validatePIN(pin: string): PINValidationResult {
  if (!pin || pin.length === 0) {
    return { valid: false, error: "PIN is required" };
  }

  if (pin.length !== 6) {
    return { valid: false, error: "PIN must be exactly 6 digits" };
  }

  if (!/^\d{6}$/.test(pin)) {
    return { valid: false, error: "PIN must contain only digits" };
  }

  return { valid: true };
}

export function hashPIN(pin: string): string {
  return ethers.sha256(ethers.toUtf8Bytes(pin));
}

export function storePINHash(pinHash: string, walletAddress: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = `${PIN_HASH_KEY}_${walletAddress.toLowerCase()}`;
  localStorage.setItem(key, pinHash);
}

export function verifyPIN(pin: string, walletAddress: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const lockoutStatus = checkPINLockout(walletAddress);
  if (lockoutStatus.locked) {
    return false;
  }

  const key = `${PIN_HASH_KEY}_${walletAddress.toLowerCase()}`;
  const storedHash = localStorage.getItem(key);

  if (!storedHash) {
    recordFailedAttempt(walletAddress);
    return false;
  }

  const pinHash = hashPIN(pin);
  const isValid = pinHash === storedHash;

  if (!isValid) {
    recordFailedAttempt(walletAddress);
  } else {
    clearFailedAttempts(walletAddress);
  }

  return isValid;
}

export function checkPINLockout(walletAddress: string): PINLockoutStatus {
  if (typeof window === "undefined") {
    return { locked: false };
  }

  const lockoutKey = `${PIN_LOCKOUT_KEY}_${walletAddress.toLowerCase()}`;
  const lockoutData = localStorage.getItem(lockoutKey);

  if (!lockoutData) {
    return { locked: false };
  }

  const lockoutUntil = parseInt(lockoutData, 10);
  const now = Date.now();

  if (now < lockoutUntil) {
    const remainingTime = Math.ceil((lockoutUntil - now) / 1000);
    return { locked: true, remainingTime };
  }

  localStorage.removeItem(lockoutKey);
  return { locked: false };
}

function recordFailedAttempt(walletAddress: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const attemptsKey = `${PIN_ATTEMPTS_KEY}_${walletAddress.toLowerCase()}`;
  const attemptsData = localStorage.getItem(attemptsKey);
  const attempts = attemptsData ? parseInt(attemptsData, 10) : 0;
  const newAttempts = attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    const lockoutKey = `${PIN_LOCKOUT_KEY}_${walletAddress.toLowerCase()}`;
    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem(lockoutKey, lockoutUntil.toString());
    localStorage.removeItem(attemptsKey);
  } else {
    localStorage.setItem(attemptsKey, newAttempts.toString());
  }
}

function clearFailedAttempts(walletAddress: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const attemptsKey = `${PIN_ATTEMPTS_KEY}_${walletAddress.toLowerCase()}`;
  const lockoutKey = `${PIN_LOCKOUT_KEY}_${walletAddress.toLowerCase()}`;

  localStorage.removeItem(attemptsKey);
  localStorage.removeItem(lockoutKey);
}

export function hasPINHash(walletAddress: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const key = `${PIN_HASH_KEY}_${walletAddress.toLowerCase()}`;
  return !!localStorage.getItem(key);
}
