import dayjs from "dayjs";

export type PetWeightUnit = "kg" | "lb";

interface PetWeightFields {
  weight?: string | null;
  weightValue?: number | string | null;
  weightUnit?: PetWeightUnit | "lbs" | null;
}

const HUMAN_YEAR_RATIO: Record<string, number> = {
  dog: 7,
  cat: 4,
  bird: 3,
  rabbit: 6,
  hamster: 25,
  other: 5,
};

export function calculateAnimalAge(
  birthdate?: string | Date | null,
  animalType?: string | null,
) {
  const now = dayjs();
  const birth = dayjs(birthdate);

  if (!birthdate || !birth.isValid() || birth.isAfter(now)) return null;

  const years = now.diff(birth, "year");
  const afterYears = birth.add(years, "year");
  const months = now.diff(afterYears, "month");
  const afterMonths = afterYears.add(months, "month");
  const days = now.diff(afterMonths, "day");
  const totalMonths = now.diff(birth, "month");

  const animalTypeKey = animalType ?? "other";
  const ratio =
    animalTypeKey in HUMAN_YEAR_RATIO
      ? HUMAN_YEAR_RATIO[animalTypeKey]
      : HUMAN_YEAR_RATIO.other;
  const humanYears = Math.round((totalMonths / 12) * ratio);

  return { years, months, days, humanYears };
}

export function normalizePetWeightUnit(
  unit?: string | null,
): PetWeightUnit | undefined {
  if (unit === "kg" || unit === "lb") {
    return unit;
  }

  if (unit === "lbs") {
    return "lb";
  }

  return undefined;
}

export function parsePetWeight(weight?: string | null):
  | {
      weightValue: number;
      weightUnit: PetWeightUnit;
    }
  | undefined {
  if (!weight) {
    return undefined;
  }

  const [rawValue, rawUnit] = weight.trim().split(/\s+/);
  const weightValue = Number(rawValue?.replace(",", "."));
  const weightUnit = normalizePetWeightUnit(rawUnit);

  if (!Number.isFinite(weightValue) || !weightUnit) {
    return undefined;
  }

  return {
    weightValue,
    weightUnit,
  };
}

export function formatPetWeight({
  weight,
  weightUnit,
  weightValue,
}: PetWeightFields): string {
  if (weightValue !== null && weightValue !== undefined && weightUnit) {
    const normalizedUnit = normalizePetWeightUnit(weightUnit);

    if (normalizedUnit) {
      return `${weightValue} ${normalizedUnit}`;
    }
  }

  return weight ?? "";
}
