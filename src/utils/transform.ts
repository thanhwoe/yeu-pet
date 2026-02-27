export const jsonValueToStringMap = (value: unknown) => {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [k, v]) => {
      if (v === null || v === undefined) acc[k] = '';
      else if (typeof v === 'object') acc[k] = JSON.stringify(v);
      else acc[k] = String(v as any);
      return acc;
    },
    {} as Record<string, string>,
  );
};
