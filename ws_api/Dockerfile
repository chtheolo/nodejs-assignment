FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/websocket_api

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle the app source code
COPY . .

CMD [ "npm", "run", "start" ]