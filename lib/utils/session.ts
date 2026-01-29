const SESSION_KEY = "cypher_session";

export interface SessionData {
  walletAddress: string;
  username: string;
  timestamp: number;
}

export function saveSession(walletAddress: string, username: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const sessionData: SessionData = {
    walletAddress: walletAddress.toLowerCase(),
    username,
    timestamp: Date.now(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

export function getSession(): SessionData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    return null;
  }

  try {
    return JSON.parse(sessionData) as SessionData;
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return getSession() !== null;
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUsername(): string | null {
  const session = getSession();
  return session?.username || null;
}

export function getSessionWalletAddress(): string | null {
  const session = getSession();
  return session?.walletAddress || null;
}
