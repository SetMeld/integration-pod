# Integration Pod

This is a standard Solid pod with extra routes to handle deploying an integration. Going to the `./integration/*` route will give you a dashboard 

## Run everything

One time before running docker:
```bash
sudo npm run setup
```

Then run docker
```bash
npm run docker:prod
```

Alernatively you can run `npm run docker:dev` to watch for changes. Note, on some machines, the UI may have trouble building so you can run `npm run watch:ui` in a separate window to also enable wathing the UI.

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