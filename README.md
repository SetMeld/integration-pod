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

## Building and publishing

Create Secrets
```bash
cd infra
ansible-vault create secrets.yml
ansible-vault edit secrets.yml
```

Add secrets like the following
```bash
dockerhub_username: exampleuser
dockerhub_password: examplepass
domain: example.com
email: example@example.com
```

Add hosts
```bash
[web]
your-server-ip ansible_user=ubuntu
```

Build and publish
```bash
docker buildx create --use
docker buildx build --platform linux/amd64 -t jaxoncreed/integration-pod:latest --push .
```

Run Ansible
```bash
ansible-playbook -i hosts playbook.yml --ask-vault-pass
```

## Hacks to Set Up the Server

The UI for this server isn't completely automatic yet. Therefore, there are some manual setup things you'll need to do:

### 1. Create an Admin Account:

 - On the main page (for example http://localhost:3000/), click the "Sign up for an account."
 - Create an account with your username and password.
 - Click the "Create Pod" link.
 - Ensure that the name of this Pod is "admin"


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