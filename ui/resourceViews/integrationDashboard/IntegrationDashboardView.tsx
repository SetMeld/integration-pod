import React, { FunctionComponent } from 'react';
import { Text } from '~/components/ui/text';
import { useTargetResource } from '~/components/TargetResourceProvider';

export const IntegrationDashboardView: FunctionComponent = () => {
  const { targetResource, navigateTo } = useTargetResource();
  
  return <Text>Integration Dashboard</Text>;
};
