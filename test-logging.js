const { createIntegrationLogger, logCommandOutput } = require('./dist/utils/logger');

async function testLogging() {
  console.log('Testing logging system...');

  // Test basic logging
  const logger = createIntegrationLogger('test-integration');

  logger.info('Test integration started', { testData: 'hello world' });
  logger.warn('This is a warning message');
  logger.error('This is an error message', { errorCode: 500 });

  // Test command output logging
  await logCommandOutput(
    'test-integration',
    'echo "test command"',
    'test command\n',
    '',
    0
  );

  await logCommandOutput(
    'test-integration',
    'invalid-command',
    '',
    'command not found',
    127
  );

  console.log('Logging test completed. Check /app/integrations-meta/test-integration/logs/');
}

testLogging().catch(console.error);
