import React from 'react';
import { DataBrowser } from '~/components/DataBrowser';
import { Text } from '~/components/ui/text';
import { RawCodeConfig } from '~/resourceViews/RawCode/RawCodeConfig';
import { ContainerConfig } from '~/resourceViews/Container/ContainerConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import "../global.css";
import { IntegrationDashboardConfig } from 'resourceViews/integrationDashboard/IntegrationDashboardConfig';


export function Screen() {

  return (
    <SafeAreaProvider>
      <StatusBar />
      <DataBrowser
        views={[IntegrationDashboardConfig, ContainerConfig, RawCodeConfig]}
        mode={'server-ui'}
        renderHomepage={() => <Text>Hopepage</Text>}
        renderLogo={() => <Text>Logo</Text>}
      />
    </SafeAreaProvider>
  );
}
