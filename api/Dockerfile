FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/api_mongo

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle the app source code
COPY . .

# EXPOSE 8080

CMD [ "npm", "run", "start" ]