export interface UserInfo {
  userId: string;
  email: string;
  isActive: boolean;
  username?: string;
  avatarUrl?: string;
}

export interface LoginInfo {
  accessToken: string;
  tokenType: string;
}
