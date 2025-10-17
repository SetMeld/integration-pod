
import { ResourceViewConfig } from "linked-data-browser";
import { LayoutDashboard } from "lucide-react-native";
import { IntegrationDashboardView } from "./IntegrationDashboardView";


export const IntegrationDashboardConfig: ResourceViewConfig = {
  name: 'integrationDashboard',
  displayName: 'Integration Dashboard',
  displayIcon: LayoutDashboard,
  view: IntegrationDashboardView,
  canDisplay: (targetUri) => {
    const url = new URL(targetUri);
    return url.pathname.startsWith("/.integration/");
  },
};
