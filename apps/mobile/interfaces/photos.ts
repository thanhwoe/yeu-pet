export interface IPhoto {
  id: string;
  accountId?: string;
  account_id?: string;
  caption: string;
  url: string;
  isPrivate?: boolean;
  is_public?: boolean;
  is_private?: boolean;
  commentCount?: number | null;
  comments?: number | null;
  likeCount?: number | null;
  likes?: number | null;
  viewCount?: number | null;
  views?: number | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  accounts: {
    id?: string;
    last_name?: string;
    lastName?: string;
    account_id?: string;
    accountId?: string;
    avatar_url?: string | null;
    avatarUrl?: string | null;
    first_name?: string;
    firstName?: string;
  };
  liked?: boolean;
}
