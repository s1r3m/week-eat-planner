export interface AccessToken {
  access_token: string;
  token_type: string;
}

export interface UserInfo {
  user_id: string;
  email: string;
  is_active: boolean;
}

export interface LoginInfo {
  access_token: string;
  token_type: string;
}
