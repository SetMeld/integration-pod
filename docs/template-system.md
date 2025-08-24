# Initial Integration Template

The integration creation system uses EJS templates to generate integration files dynamically.

## Overview

Instead of hard-coding file content, the system traverses the `templates/integration/` directory and copies all files, processing `.ejs` templates with integration-specific data.

## Template Directory Structure

```
templates/integration/
├── package.json.ejs      # Node.js package configuration
├── index.js.ejs          # Main integration file
├── README.md.ejs         # Integration documentation
└── [any other files]     # Additional files will be copied automatically
```

## Template Data

All templates have access to the following data:

- `integrationId`: Unique identifier for the integration
- `displayName`: Human-readable name for the integration
- `targetFile`: Target file path for the integration
- `createdAt`: ISO timestamp when the integration was created

## File Processing

- **`.ejs` files**: Processed as templates with variable substitution
- **Other files**: Copied as-is (useful for binary files, configs, etc.)

## Adding New Templates

Simply add any file to `templates/integration/` and it will be automatically included when creating new integrations.

## Logging

The template system uses structured logging with integration-specific loggers for proper debugging and monitoring.
