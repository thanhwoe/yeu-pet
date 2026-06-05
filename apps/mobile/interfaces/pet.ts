export interface IPet {
  id: string;
  name: string;
  age: string | null;
  birthdate: string | null;
  breed: string | null;
  weight: string | null;
  weightValue: number | string | null;
  weightUnit: "kg" | "lb" | null;
  color: string | null;
  avatarUrl: string | null;
  gender: string;
  species: string;
  notes: string | null;
}
