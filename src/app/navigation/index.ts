import { useAuthContext } from "../contexts/auth/context";
import { apps } from "./segments/apps";
import { getAssetsNav } from "./segments/assets";
import { components } from "./segments/components";
import { dashboards } from "./segments/dashboards";
import { docs } from "./segments/docs";
import { forms } from "./segments/forms";
import { prototypes } from "./segments/prototypes";
import { tables } from "./segments/tables";

export function useNavigation() {
  const { user } = useAuthContext();
  const assetTypes = user?.meta?.assetTypes || [];

  return [
    dashboards,
    getAssetsNav(assetTypes),   // ✅ Dynamic
    apps,
    prototypes,
    tables,
    forms,
    components,
    docs,
  ];
}
