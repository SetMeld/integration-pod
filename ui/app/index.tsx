import React from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import "../global.css";
import { IntegrationDashboardConfig } from 'resourceViews/integrationDashboard/IntegrationDashboardConfig';
import { HomeConfig } from 'resourceViews/home/HomeConfig';
import { ContainerConfig, DataBrowser, ProfileConfig, RawCodeConfig, Text } from 'linked-data-browser';


export function Screen() {

  return (
    <SafeAreaProvider>
      <StatusBar />
      <DataBrowser
        views={[HomeConfig, IntegrationDashboardConfig, ProfileConfig, ContainerConfig, RawCodeConfig]}
        mode={'server-ui'}
        renderLogo={() => <Text>Logo</Text>}
      />
    </SafeAreaProvider>
  );
}
