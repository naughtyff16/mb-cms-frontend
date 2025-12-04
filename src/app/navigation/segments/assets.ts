import { NavigationTree } from "@/@types/navigation";
import { useAuthContext } from "@/app/contexts/auth/context";

const ROOT_ASSETS = "/assets";

const path = (root: string, item: string) => `${root}${item}`;

// const { user } = useAuthContext();
// console.log("user in nav assets segment", user);



export const assets: NavigationTree = {
  id: "assets",
  type: "root",
  path: "assets",
  title: "Content Management",
  transKey: "nav.assets.content_management",
  icon: "prototypes",
  childs: [
    {
      id: "assets.content",
      path: "/assets",
      type: "collapse",
      title: "Content",
      transKey: "nav.assets.content",
      icon: "prototypes.onboarding",
      childs: [
        {
          id: "assets.movies",
          type: "item",
          path: path(ROOT_ASSETS, "/movies"),
          title: "Movies",
          transKey: "nav.assets.movies",
          icon: "prototypes",
        },
        {
          id: "assets.series",
          type: "item",
          path: path(ROOT_ASSETS, "/series"),
          title: "Series",
          transKey: "nav.assets.series",
          icon: "prototypes",
        },
        {
          id: "assets.seasons",
          type: "item",
          path: path(ROOT_ASSETS, "/seasons"),
          title: "Seasons",
          transKey: "nav.assets.seasons",
          icon: "prototypes",
        },
        {
          id: "assets.episodes",
          type: "item",
          path: path(ROOT_ASSETS, "/episodes"),
          title: "Episodes",
          transKey: "nav.assets.episodes",
          icon: "prototypes",
        },
        {
          id: "assets.channels",
          type: "item",
          path: path(ROOT_ASSETS, "/channels"),
          title: "Channels",
          transKey: "nav.assets.channels",
          icon: "prototypes",
        },
        {
          id: "assets.videos",
          type: "item",
          path: path(ROOT_ASSETS, "/videos"),
          title: "Videos",
          transKey: "nav.assets.videos",
          icon: "prototypes",
        },
        {
          id: "assets.generic",
          type: "item",
          path: path(ROOT_ASSETS, "/generic"),
          title: "Generic",
          transKey: "nav.assets.generic",
          icon: "prototypes",
        },
      ],
    },
  ],
};
