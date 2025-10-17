import React, { FunctionComponent, use, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Large Title */}
        <Text style={styles.title}>
          HODA Digital
        </Text>

        {/* Login Button */}
        <Button
          text="Log in with your Pod"
          variant="default"
          style={styles.button}
          onPress={() => login(DEFAULT_ISSUER)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 32,
    maxWidth: 448,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
