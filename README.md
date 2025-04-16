# Integration Pod

This is a standard Solid pod with extra routes to handle deploying an integration. Going to the `./integration/*` route will give you a dashboard 

## API

 - GET `./integration/api/integration`: Gets a list of all integrations
 - POST `./integration/api/integration`: Creates a new integration
 - GET `./integration/api/integration/:id`: Returns integration information
 - PUT `./integration/api/integration/:id`: Updates the integration
 - GET `./integration/api/integration/:id/log/deploy`: Get Deploy Log
 - GET `./integration/api/integration/:id/log/trigger`: Get Deploy Log
 - GET `./integration/api/integration/:id/log/integration`: Get Deploy Log


Integration JSON:
```typescript
interface Integration {
  "id": string;
  status: string
  statusMessage?: string;
  "gitAddress": string;
}
```