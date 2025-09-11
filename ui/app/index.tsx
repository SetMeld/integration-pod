import React from 'react';
import { DataBrowser } from '~/components/DataBrowser';
import { Text } from '~/components/ui/text';
import { RawCodeConfig } from '~/resourceViews/RawCode/RawCodeConfig';
import { ContainerConfig } from '~/resourceViews/Container/ContainerConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import "../global.css";
import { IntegrationDashboardConfig } from 'resourceViews/integrationDashboard/IntegrationDashboardConfig';
import { HomeConfig } from 'resourceViews/home/HomeConfig';
import { HomeView } from 'resourceViews/home/HomeView';


export function Screen() {

  return (
    <SafeAreaProvider>
      <StatusBar />
      <DataBrowser
        views={[HomeConfig, IntegrationDashboardConfig, ContainerConfig, RawCodeConfig]}
        mode={'server-ui'}
        renderHomepage={() => <HomeView />}
        renderLogo={() => <Text>Logo</Text>}
      />
    </SafeAreaProvider>
  );
}
