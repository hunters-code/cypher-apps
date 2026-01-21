export interface PendingRegistration {
  id: string;
  username: string;
  wallet_address: string;
  viewing_key: string;
  viewing_key_private: string;
  spending_key: string;
  spending_key_private: string;
  created_at: string;
  expires_at: string;
  completed: boolean;
}

export interface CreatePendingRegistrationParams {
  username: string;
  walletAddress: string;
  viewingKey: string;
  viewingKeyPrivate: string;
  spendingKey: string;
  spendingKeyPrivate: string;
}
