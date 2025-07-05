
import { ResourceViewConfig } from "~/components/ResourceView";
import { LayoutDashboard } from "../../common/icons/LayoutDashboard";
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
