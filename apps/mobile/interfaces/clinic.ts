export interface IClinic {
  clinic_id: string;
  name: string;
  open_time: string;
  close_time: string;
  address: string;
  phone: string;
  city: string;
  avatar_url: string | null;
  is_fulltime: boolean;
  created_at: string;
  updated_at: string;
}
