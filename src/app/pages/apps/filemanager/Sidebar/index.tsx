// Local Imports
import { MainPanel } from "@/app/layouts/MainLayout/Sidebar/MainPanel";
import { SidebarPanel } from "./SidebarPanel";
import { useNavigation } from "@/app/navigation";

// ----------------------------------------------------------------------

export function Sidebar() {
    const navigation = useNavigation();
  
  return (
    <>
      <MainPanel nav={navigation} activeSegmentPath="/apps" />
      <SidebarPanel />
    </>
  );
}
