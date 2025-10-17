
import { ResourceViewConfig } from "linked-data-browser";
import { Home } from "lucide-react-native";
import { HomeView } from "./HomeView";


export const HomeConfig: ResourceViewConfig = {
  name: 'home',
  displayName: 'Home',
  displayIcon: Home,
  view: HomeView,
  canDisplay: (targetUri) => {
    const url = new URL(targetUri);
    return url.pathname === "/";
  },
};
