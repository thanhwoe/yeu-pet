import { type TFunction } from "i18next";

const translateArray = (t: TFunction, key: string, count: number) =>
  Array.from({ length: count }, (_, index) => t(`${key}.${index}`));

const TRAINING_DATA = [
  {
    id: "level1",
    level: 1,
    titleKey: "training.levels.basic.title",
    exercises: [
      {
        id: "1",
        key: "callName",
        stepsCount: 3,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755069205/c3bd2d03-ab9a-4f99-b980-5e0be30ff320_ykdswf.jpg",
      },
      {
        id: "2",
        key: "sit",
        stepsCount: 4,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1754906479/8fa62ea4-554b-482c-b34d-967cafc2ce8f_wzri8m.jpg",
      },
      {
        id: "3",
        key: "comeHere",
        stepsCount: 3,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1754906479/b2722096-11f8-491c-ba29-7bc96791b6ce_kfqr6a.jpg",
      },
    ],
  },
  {
    id: "level2",
    level: 2,
    titleKey: "training.levels.intermediate.title",
    exercises: [
      {
        id: "4",
        key: "lieDown",
        stepsCount: 4,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1754906481/d87be049-e04b-4f3a-b8b6-5aef8ace4713_xuyjki.jpg",
      },
      {
        id: "5",
        key: "stay",
        stepsCount: 3,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755069346/1b1d8fbd-0bfa-4504-9bd3-bacc8f7c07f5_ou0snj.jpg",
      },
      {
        id: "6",
        key: "shake",
        stepsCount: 3,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755071308/openart-image_MYmcm0hE_1755069998181_raw_ofgf3u.jpg",
      },
    ],
  },
  {
    id: "level3",
    level: 3,
    titleKey: "training.levels.advanced.title",
    exercises: [
      {
        id: "7",
        key: "rollOver",
        stepsCount: 4,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755071442/openart-image_TrgBffns_1755071375237_raw_vozdy1.jpg",
      },
      {
        id: "8",
        key: "fetch",
        stepsCount: 3,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755071511/openart-image_95tsYyU4_1755071495705_raw_uhyzda.jpg",
      },
      {
        id: "9",
        key: "jumpThroughHoop",
        stepsCount: 4,
        tricksCount: 1,
        image_url:
          "https://res.cloudinary.com/dyb7bxdw7/image/upload/v1755071562/openart-image_5go906m__1755071546673_raw_wu7iu5.jpg",
      },
    ],
  },
] as const;

export const getTrainingData = (t: TFunction) =>
  TRAINING_DATA.map((level) => ({
    id: level.id,
    level: level.level,
    title: t(level.titleKey),
    exercises: level.exercises.map((exercise) => {
      const key = `training.exercises.${exercise.key}`;

      return {
        id: exercise.id,
        title: t(`${key}.title`),
        goal: t(`${key}.goal`),
        steps: translateArray(t, `${key}.steps`, exercise.stepsCount),
        tricks: translateArray(t, `${key}.tricks`, exercise.tricksCount),
        image_url: exercise.image_url,
      };
    }),
  }));

export type TrainingLevel = ReturnType<typeof getTrainingData>[number];
export type TrainingExercise = TrainingLevel["exercises"][number];
