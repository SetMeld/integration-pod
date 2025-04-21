FROM node:20

WORKDIR /app

# Copy package.json and install deps
COPY ./package*.json ./
RUN npm install --omit=dev

# Copy Solid config and data (will mount host volume later)
COPY ./config ./config

# Copy the rest of the source (if needed)
COPY ./dist ./dist

# Make sure the entrypoint has permission to read/write data
RUN mkdir -p /app/data && chown -R node:node /app/data

# Switch to node user for better security
USER node

EXPOSE 3000

CMD ["./node_modules/@solid/community-server/bin/server.js", \
  "-c", "./config/config.json", "-m", "./", "-f", "./data"]