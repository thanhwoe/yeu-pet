# Settings UI Redesign Audit

## Before Screenshots

- Top: `/private/tmp/settings-before-top.png`
- Middle: covered by simulator accessibility inspection for subscription and notifications; CUA scroll gestures intermittently failed with `noWindowsAvailable`.
- Bottom: `/private/tmp/settings-before-bottom.png`

## After Screenshots

- Top/final: `/private/tmp/settings-after-top-final.png`
- Middle/lower: `/private/tmp/settings-after-middle.png`
- Note: CUA scroll remained intermittent after the final safe-area padding change. The lower content was inspected through the simulator accessibility tree and the layout was adjusted in code with `pb-120` to keep logout above the tab bar.

## Visual Hierarchy Issues

- The screen uses explanatory copy under almost every section, so primary settings compete with secondary descriptions.
- The signed-in card, account card, subscription card, and rows all have similar weight, making it hard to scan in 5-10 seconds.
- Subscription is too large for a settings screen and mixes plan state, usage, upgrade messaging, and developer actions in one user-facing section.
- Logout is visible but the surrounding copy and red action do not feel clearly separated from normal settings.

## Color/Token Issues

- In light mode, `text-secondary` resolves to orange, so ordinary descriptions look like accent text.
- `line-secondary` resolves to strong amber, causing row dividers and card borders to feel orange and overused.
- Accent orange appears in body copy, section descriptions, progress bars, tab label, and dividers at the same time.
- Settings needs muted neutral text and subtle neutral lines without broadly remapping app-wide theme tokens.

## Spacing Issues

- Section gaps are reasonable, but row descriptions make each row taller than needed.
- Cards feel flat and oversized because every section uses the same full card treatment and strong bottom borders.
- The bottom content sits close to the tab bar; final state should keep enough bottom padding.

## Typography Issues

- Body and footnote descriptions use strong orange secondary color, reducing distinction from actions and headings.
- Large title plus subtitle plus repeated section subtitles adds noise.
- Row titles are readable, but secondary metadata should be quieter and shorter.

## Unnecessary Text

- Remove page subtitle: "Manage your account, care reminders, and app preferences."
- Remove section descriptions such as "Choose which pet-care updates can reach you" and "Keep the app comfortable in any light."
- Shorten subscription copy to the plan, compact usage summary, and one CTA.
- Keep help/legal subtitles optional and short.

## Safe Area/Status Bar Issues

- Top safe area is respected on first load.
- While scrolled to the bottom, content can visually pass under the dynamic island/status area when prior rows remain partially visible.
- Final review should verify top and bottom padding while scrolling.

## Component Reuse Opportunities

- Keep `SettingsSection`, `SettingsRow`, `SegmentedSetting`, and `SettingToggle`, but tune them for Settings-specific hierarchy.
- Add Settings-local muted/line/surface classes rather than changing global theme mappings that affect unrelated screens.
- Move mock subscription controls into a separate small developer-only section.

## Proposed Redesign Plan

- Make the screen a calm grouped settings list with no page subtitle.
- Use a compact profile card with avatar, name, email, and edit action.
- Reduce subscription to plan, one-line usage summary, up to three small usage bars, and a single CTA.
- Make notifications compact rows with optional short subtitles only.
- Use segmented controls for appearance and language in compact rows.
- Keep help/legal rows compact with short trailing actions.
- Separate session/logout with danger styling that is clear but not overwhelming.
- Verify loading, error, toggles, logout confirmation, and missing subscription data.

## Final Notes

- Added Settings-scoped semantic tokens for muted text, subtle lines, surface backgrounds, and danger styling.
- Removed repeated explanatory section copy and converted most row descriptions to short labels.
- Reworked the profile area into a compact profile card with initials, name, email, and edit action.
- Compressed subscription into current plan, one-line usage summary, three usage meters, and one CTA.
- Moved mock subscription actions into a separate developer-only section.
- Added a sticky safe-area Settings header and increased bottom padding so session actions are not hidden behind the tab bar.
- Verified the redesigned top and middle/lower Settings UI in iOS Simulator and fixed the oversized usage meter found during review.
