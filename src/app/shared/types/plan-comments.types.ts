export type TCommentPhase = 'none' | 'adding' | 'editing' | 'viewing';

export interface ICommentsCountAndPhase {
  count: number;
  phase: TCommentPhase;
}

