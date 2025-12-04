import { NavigationTree } from "@/@types/navigation";
import { mapAssetTypesToNav } from "@/utils/mapAssetTypes";

const ROOT_ASSETS = "/assets";


export const getAssetsNav = (assetTypes: string[]): NavigationTree => {
  return {
    id: "assets",
    type: "root",
    path: "assets",
    title: "Content Management",
    transKey: "nav.assets.content_management",
    icon: "prototypes",
    childs: [
      {
        id: "assets.content",
        path: ROOT_ASSETS,
        type: "collapse",
        title: "Content",
        transKey: "nav.assets.content",
        icon: "prototypes.onboarding",
        // DYNAMIC CHILDREN HERE
        childs: mapAssetTypesToNav(assetTypes),
      },
    ],
  };
};
