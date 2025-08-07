export interface Character {
  id: number;
  created_at: string;
  role: string | null;
  description: string | null;
  description_character_page: string | null;
  order: number;
  name: string | null;
  is_active: boolean | null;
  usage_count: number | null;
  last_used: string | null;
  picture_select: string | null;
  ability1: string | null;
  ability1_min: number | null;
  ability1_max: number | null;
  ability2: string | null;
  ability2_min: number | null;
  ability2_max: number | null;
  images: any | null;
  user_id: string | null;
}