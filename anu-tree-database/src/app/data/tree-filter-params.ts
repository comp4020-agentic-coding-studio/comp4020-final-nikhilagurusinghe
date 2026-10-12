import type { SliderValues } from "../components/filter/slider-dropdown";

// The shape Next.js hands a page in its `searchParams` prop. A key repeated in
// the URL (`?genus=a&genus=b`) arrives as an array rather than a string.
export type SearchParams = Record<string, string | string[] | undefined>;

export type TreeFilters = {
  genus?: string[];
  commonName?: string[];
  height?: SliderValues;
  crownRadius?: SliderValues;
  diameterBreastHeight?: SliderValues;
  age?: string[];
  health?: string[];
  structure?: string[];
  classification?: string[];
};

function readParam(params: SearchParams, name: string): string | undefined {
  const rawValue = params[name];
  const value = Array.isArray(rawValue) ? rawValue.join(",") : rawValue;

  return value ? value : undefined;
}

// Filters.tsx writes multi-select params as a comma-separated list of values.
function parseList(params: SearchParams, name: string): string[] | undefined {
  const values = readParam(params, name)
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return values?.length ? values : undefined;
}

// Filters.tsx writes slider params as "startValue,endValue".
function parseRange(
  params: SearchParams,
  name: string,
): SliderValues | undefined {
  const [start, end] = readParam(params, name)?.split(",") ?? [];
  const startValue = Number(start);
  const endValue = Number(end);

  // A half-written or non-numeric range filters nothing rather than everything.
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
    return undefined;
  }

  return { startValue, endValue };
}

export function parseTreeFilters(params: SearchParams): TreeFilters {
  return {
    genus: parseList(params, "genus"),
    commonName: parseList(params, "commonName"),
    height: parseRange(params, "height"),
    crownRadius: parseRange(params, "radius"),
    diameterBreastHeight: parseRange(params, "diameter"),
    age: parseList(params, "age"),
    health: parseList(params, "health"),
    structure: parseList(params, "structure"),
    classification: parseList(params, "classification"),
  };
}
