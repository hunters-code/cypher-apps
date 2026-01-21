import type {
  CreatePendingRegistrationParams,
  PendingRegistration,
} from "@/types/pending-registration";

import { supabase } from "./client";

const EXPIRY_DAYS = 30;

export async function createPendingRegistration(
  params: CreatePendingRegistrationParams
): Promise<PendingRegistration> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  const { data, error } = await supabase
    .from("pending_registrations")
    .insert({
      username: params.username,
      wallet_address: params.walletAddress.toLowerCase(),
      viewing_key: params.viewingKey,
      viewing_key_private: params.viewingKeyPrivate,
      spending_key: params.spendingKey,
      spending_key_private: params.spendingKeyPrivate,
      expires_at: expiresAt.toISOString(),
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating pending registration:", error);
    throw new Error(`Failed to create pending registration: ${error.message}`);
  }

  return data as PendingRegistration;
}

export async function getPendingRegistrationByUsername(
  username: string
): Promise<PendingRegistration | null> {
  const { data, error } = await supabase
    .from("pending_registrations")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("completed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pending registration:", error);
    return null;
  }

  return data as PendingRegistration | null;
}

export async function getPendingRegistrationByWallet(
  walletAddress: string
): Promise<PendingRegistration | null> {
  const { data, error } = await supabase
    .from("pending_registrations")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .eq("completed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pending registration:", error);
    return null;
  }

  return data as PendingRegistration | null;
}

export async function markPendingRegistrationAsCompleted(
  username: string
): Promise<void> {
  const { error } = await supabase
    .from("pending_registrations")
    .update({ completed: true })
    .eq("username", username.toLowerCase())
    .eq("completed", false);

  if (error) {
    console.error("Error marking pending registration as completed:", error);
    throw new Error(
      `Failed to mark registration as completed: ${error.message}`
    );
  }
}

export async function checkUsernamePending(username: string): Promise<boolean> {
  const pending = await getPendingRegistrationByUsername(username);
  return pending !== null;
}
