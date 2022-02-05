FROM node:14

# Create app directory
WORKDIR /usr/src/vehicle-data-parser

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# EXPOSE 3000

CMD [ "npm", "run", "start-parser" ]