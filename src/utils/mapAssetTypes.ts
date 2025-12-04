// utils/mapAssetTypes.ts
import { NavigationTree } from "@/@types/navigation";

export function mapAssetTypesToNav(assetTypes: string[]): NavigationTree[] {
  return assetTypes
    .filter((type) => type !== "epg") // ignore unwanted types
    .map((type) => ({
      id: `assets.${type}`,
      type: "item",
      path: `/assets/${type}`,
      title: type.replace("_", " "),
      transKey: `nav.assets.${type}`,
      icon: "prototypes",
    }));
}
