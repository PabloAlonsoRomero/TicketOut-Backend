export interface RefreshToken {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: number | null;
  createdAt: Date;
}

export type CreateRefreshTokenInput = Omit<RefreshToken, 'id' | 'createdAt'>;
