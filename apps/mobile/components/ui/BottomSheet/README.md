# BottomSheet Usage

Use `components/ui/BottomSheet` for feature sheets instead of importing Gorhom sheet components directly.

```tsx
const [visible, setVisible] = useState(false);

<BottomSheet
  visible={visible}
  onDismiss={() => setVisible(false)}
  titleElement={<Body weight="semiBold">Sheet title</Body>}
>
  <FeatureForm />
</BottomSheet>
```

## Rules

- Render the sheet while the owning screen is mounted.
- Control visibility from parent state with `visible` and close by setting that state to `false`.
- The shared component wraps Gorhom `BottomSheetModal`; callers should not call `present()`, `dismiss()`, or manage refs.
- `BottomSheetModalProvider` is mounted once in `components/Providers`, so do not add another provider around feature screens.
- Use the existing form inputs inside sheet forms; `withBottomSheetKeyboardEvents` swaps them to `BottomSheetTextInput`.
- Leave `enableDynamicSizing` on for normal forms and option lists. The shared component will omit `snapPoints` so Gorhom sizes the sheet from content height.
- Pass explicit `snapPoints` only for fixed-height or full-screen sheets.
- Do not pass `snapPoints={undefined}`. Omit the prop when the shared defaults should be used.
- Avoid nested scroll views. Set `useScrollView={false}` when the child already owns scrolling.
- Keep actions in the lower part of the sheet and preserve safe-area spacing.
