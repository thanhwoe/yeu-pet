# 13 — Mobile UI/UX Skills Guide

Future frontend work on the YeuPet mobile app must use the project-local UI/UX skills in `.codex/skills`.

## When to use each skill

- `.codex/skills/pet-mobile-ui-ux-design/SKILL.md`
  - Use before designing or redesigning mobile screens, flows, empty states, copy, feature interactions, and visual hierarchy.
  - This is the source of truth for YeuPet's warm, friendly, trustworthy, clean, and practical product feel.

- `.codex/skills/react-native-expo-ui-implementation/SKILL.md`
  - Use while implementing React Native + Expo UI in `apps/mobile`.
  - This is the source of truth for NativeWind, Expo Router, component boundaries, state handling, dark mode, and accessibility implementation rules.

- `.codex/skills/mobile-ui-review-checklist/SKILL.md`
  - Use before marking any mobile UI task complete.
  - This is the required final review checklist for visual quality, state coverage, dark mode, accessibility, pet-care copy, and verification commands.

## Required frontend workflow

For every future task that changes mobile UI:

1. Read the relevant feature docs and inspect existing mobile patterns.
2. Apply `pet-mobile-ui-ux-design` to decide layout, hierarchy, copy tone, and feature UX.
3. Apply `react-native-expo-ui-implementation` while coding.
4. Verify loading, empty, error, success, dark mode, and accessibility states.
5. Apply `mobile-ui-review-checklist` before final response.

## Product bar

YeuPet should not look like an admin dashboard. Mobile screens must feel personal, caring, and practical while still being structured enough for reminders, medical records, budget statistics, sitter booking, photos, AI care guidance, and settings.

Do not rewrite the full app only to satisfy these skills. Apply them incrementally to the screens and components touched by the current task.
