# Integration Logging System

This document describes the comprehensive logging system implemented for the integration platform.

## Overview

The logging system uses Winston, a well-established Node.js logging library, to provide structured logging for all integration-related activities. Logs are stored in `/app/integrations-meta/[integration-name]/logs` and are organized by date and type.

## Features

- **Per-integration logging**: Each integration has its own log directory
- **Daily rotation**: Log files are rotated daily to manage disk space
- **Multiple log levels**: Support for debug, info, warn, and error levels
- **Console capture**: Integration console output is captured and logged
- **Command output logging**: All executed commands (git clone, npm install, etc.) are logged
- **Structured logging**: JSON format for easy parsing and analysis
- **Error tracking**: Separate error log files for better error analysis

## Log Structure

```
/app/integrations-meta/
├── [integration-name]/
│   └── logs/
│       ├── integration-2024-01-15.log    # General integration logs
│       ├── error-2024-01-15.log          # Error logs
│       └── system-2024-01-15.log         # System-level logs
└── system-2024-01-15.log                 # Global system logs

/app/general-logs/
├── general-2024-01-15.log                # General application logs
└── error-2024-01-15.log                  # General error logs
```

## Log Types

### Integration Logs (`integration-YYYY-MM-DD.log`)
- Integration execution details
- Console output from integrations
- Function entry/exit points
- Data processing information

### Error Logs (`error-YYYY-MM-DD.log`)
- Error messages and stack traces
- Failed command executions
- Integration failures

### System Logs (`system-YYYY-MM-DD.log`)
- Application startup/shutdown
- Configuration changes
- System-level events

### General Logs (`general-YYYY-MM-DD.log`)
- API errors and exceptions
- Application-wide events
- General error logging (replaces console.error)
- Logging system initialization errors

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set the minimum log level (debug, info, warn, error)
  - Default: `info`
  - Example: `LOG_LEVEL=debug`

### Log Rotation Settings

- **Max file size**: 20MB
- **Retention**: 14 days for regular logs, 30 days for error logs
- **Compression**: Old log files are automatically compressed

## API Endpoints

### Get Logs List
```
GET /integration/:integrationName/logs
```

Returns a list of available log files for an integration.

### Get Log Content
```
GET /integration/:integrationName/logs/:type?date=YYYY-MM-DD
```

Returns the content of a specific log file.

Parameters:
- `type`: Log type (integration, error, system)
- `date`: Optional date filter (YYYY-MM-DD format)

## Usage Examples

### Basic Logging
```typescript
import { createIntegrationLogger, generalLogger } from '../utils/logger';

// Integration-specific logging
const logger = createIntegrationLogger('my-integration');
logger.info('Integration started', { data: inputData });
logger.error('Something went wrong', { error: errorMessage });

// General application logging
generalLogger.info('Application event', { event: 'user_login' });
generalLogger.error('System error', { error: errorMessage });
```

### Command Output Logging
```typescript
import { logCommandOutput } from '../utils/logger';

await logCommandOutput(
  'my-integration',
  'npm install',
  stdout,
  stderr,
  exitCode
);
```

### Console Capture
```typescript
import { captureConsoleForIntegration } from '../utils/consoleCapture';

const capturedConsole = captureConsoleForIntegration('my-integration');

// All console.log, console.error, etc. calls will be logged
console.log('This will be captured and logged');

// Restore original console when done
capturedConsole.restore();
```

## Integration with Existing Code

The logging system has been integrated into:

1. **Post-commit handler**: Logs git operations and npm install commands
2. **Integration runner**: Logs integration execution and console output
3. **Integration return handler**: Logs data processing steps
4. **API endpoints**: Logs requests and responses

## Best Practices

1. **Use appropriate log levels**:
   - `debug`: Detailed debugging information
   - `info`: General information about application flow
   - `warn`: Warning messages for potentially harmful situations
   - `error`: Error messages for failed operations

2. **Include context**: Always include relevant data in log messages
   ```typescript
   logger.info('Processing file', { 
     fileName: 'data.csv', 
     size: fileSize,
     integration: 'salesforce' 
   });
   ```

3. **Handle errors properly**: Always log errors with stack traces
   ```typescript
   try {
     // Some operation
   } catch (error) {
     logger.error('Operation failed', { 
       error: error.message,
       stack: error.stack 
     });
   }
   ```

4. **Use structured logging**: Include metadata in log objects rather than concatenating strings

## Monitoring and Analysis

Log files can be analyzed using standard log analysis tools:

- **grep**: Search for specific patterns
- **jq**: Parse JSON log entries
- **logrotate**: System-level log rotation
- **ELK Stack**: Advanced log analysis and visualization

## Troubleshooting

### Common Issues

1. **Log directory not found**: Ensure `/app/integrations-meta` exists and is writable
2. **Permission denied**: Check file permissions on log directories
3. **Disk space**: Monitor log file sizes and adjust retention settings

### Debug Mode

Enable debug logging by setting:
```bash
export LOG_LEVEL=debug
```

This will provide detailed logging information for troubleshooting.
