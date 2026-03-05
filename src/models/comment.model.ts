export interface Comment {
  id: number;
  body: string;
  isInternal: boolean;
  ticketId: number;
  authorId: number;
  createdAt: Date;
}

export type CreateCommentInput = Omit<Comment, 'id' | 'createdAt'>;
