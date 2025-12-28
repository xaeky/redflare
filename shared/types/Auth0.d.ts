export interface Auth0UserInfoResponse {
  user_id: string;
  email: string;
  email_verified: boolean;
  username: string;
  phone_number: string;
  phone_verified: boolean;
  created_at: string | { [key: string]: any; };
  updated_at: string | { [key: string]: any; };
  identities: any;
  app_metadata: {
      [key: string]: any;
  };
  user_metadata: {
      [key: string]: any;
  };
  picture: string;
  name: string;
  nickname: string;
  multifactor: Array<string>;
  last_ip: string;
  logins_count: number;
  blocked: boolean;
  given_name: string;
  family_name: string;
};