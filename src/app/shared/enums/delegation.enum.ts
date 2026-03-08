export enum EDelegationStatus {
  ACTIVE = 1,
  DEACTIVATED = 2,
  EXPIRED = 3,
  UPCOMING = 4
}

export enum EDelegationActions {
  CANCEL = 1,
  Update = 2,
  DELETE = 3
}


export enum EImpersonationStatus {
  NOUN = 'noun',
  DELEGATOR = 'delegator',
  DELEGATEE = 'delegatee'
}