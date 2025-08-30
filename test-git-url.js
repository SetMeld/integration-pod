// Test script to verify the new git URL generation
const { getIntegrationGitSshUrl } = require('./dist/integrationStorage/integrationGit.storage.js');
const { setGlobals } = require('./dist/globals.js');

// Test development mode
console.log('Testing development mode:');
setGlobals({
  gitUri: 'git@localhost:2229',
  integrationGitPath: '/Users/jacksonmorgan/O/integration-pod/data/.internal/integration-git'
});

const devUrl = getIntegrationGitSshUrl('ce7212394765dfa6');
console.log('Dev URL:', devUrl);

// Test production mode
console.log('\nTesting production mode:');
setGlobals({
  gitUri: 'git@example.com:2222',
  integrationGitPath: '/srv/git'
});

const prodUrl = getIntegrationGitSshUrl('ce7212394765dfa6');
console.log('Prod URL:', prodUrl);
