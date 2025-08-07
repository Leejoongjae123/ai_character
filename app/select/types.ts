export interface Character {
  id: number;
  role: string;
  description: string;
  picture_select: string;
  order: number;
  created_at: string;
}

export interface CharactersResponse {
  characters: Character[];
}

export interface RoleCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (characterId: number) => void;
}