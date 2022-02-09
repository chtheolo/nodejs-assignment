FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/websocket_clients

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle the app source code
COPY . .

# EXPOSE 8080

ENV mode="start"

CMD ["sh", "-c", "npm run ${mode}"]