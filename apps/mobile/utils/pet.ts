import dayjs from "dayjs";

const HUMAN_YEAR_RATIO: Record<string, number> = {
  dog: 7,
  cat: 4,
  bird: 3,
  rabbit: 6,
  hamster: 25,
  other: 5,
};

export function calculateAnimalAge(
  birthdate: string | Date,
  animalType: string,
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

  const ratio =
    animalType in HUMAN_YEAR_RATIO
      ? HUMAN_YEAR_RATIO[animalType]
      : HUMAN_YEAR_RATIO.other;
  const humanYears = Math.round((totalMonths / 12) * ratio);

  return { years, months, days, humanYears };
}
