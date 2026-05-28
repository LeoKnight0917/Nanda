export type CanonicalJsonValue =
  | string
  | number
  | boolean
  | null
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

function sortObjectKeys(value: CanonicalJsonValue): CanonicalJsonValue {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, sortObjectKeys(child)] as const);

    return Object.fromEntries(sortedEntries);
  }

  return value;
}

export function canonicalStringify(payload: CanonicalJsonValue): string {
  return JSON.stringify(sortObjectKeys(payload));
}
