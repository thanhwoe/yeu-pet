export interface IPhoto {
  id: string;
  account_id: string;
  caption: string;
  url: string;
  is_public: boolean;
  likes: number | null;
  views: number | null;
  created_at: string;
  updated_at: string;
  accounts: {
    last_name: string;
    account_id: string;
    avatar_url: string | null;
    first_name: string;
  };
  liked?: boolean;
}
