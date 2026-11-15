// The colour of a tree's dot on the map, by classification. Shared by the map
// markers and the liked trees cards so a card's dot matches the tree's.
export function classificationColour(classification: string): string {
  if (
    classification === "Eucalyptus" ||
    classification === "Remnant Eucalyptus" ||
    classification === "Other Eucalyptus"
  ) {
    return "#ff5050";
  }
  if (classification === "Deciduous") return "#109b58";
  if (classification === "Evergreen") return "#82b649";
  if (classification === "Conifer") return "#0097a7";
  return "#125938";
}
