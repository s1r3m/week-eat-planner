export interface UserInfo {
  user_id: string;
  email: string;
  is_active: boolean;
  username?: string;
  avatar_url?: string;
}

export interface LoginInfo {
  access_token: string;
  token_type: string;
}
