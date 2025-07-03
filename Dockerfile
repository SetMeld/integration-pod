FROM node:20

WORKDIR /app

# Copy the rest of the source
COPY . .

# Install server dependencies
COPY package*.json ./
RUN npm install

# Install UI dependencies inside container
COPY ./ui/package*.json ./ui/
RUN cd ui && npm install


RUN npm run build

# Make sure data folder exists for runtime
RUN mkdir -p /app/data && chown -R node:node /app/data
RUN mkdir -p /app/integrations && chown -R node:node /app/integrations

# Use a non-root user for security
USER node

EXPOSE 3000

# Optional: only needed for `docker compose` without `command:` override
CMD ["npm", "start"]
