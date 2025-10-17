import React, { FunctionComponent, use, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, useTargetResource } from "linked-data-browser";
import { useSolidAuth, useRootContainerFor } from '@ldo/solid-react';
import { SolidContainerUri } from '@ldo/connected-solid';

const DEFAULT_ISSUER = window.location.origin;

export const HomeView: FunctionComponent = () => {
  const { login, session } = useSolidAuth();
  const { navigateTo } = useTargetResource();
  const rootDirectory = useRootContainerFor(
    session.webId as SolidContainerUri | undefined
  );

  useEffect(() => {
    if (rootDirectory?.uri) {
      navigateTo(rootDirectory.uri);
    }
  }, [rootDirectory?.uri]);

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <View className="items-center space-y-8 max-w-md">
        {/* Large Title */}
        <Text className="text-6xl font-bold text-foreground text-center">
          HODA Digital
        </Text>
        
        {/* Login Button */}
        <Button
          text="Log in with your Pod"
          variant="default"
          className="w-full"
          onPress={() => login(DEFAULT_ISSUER)}
        />
      </View>
    </View>
  );
};
