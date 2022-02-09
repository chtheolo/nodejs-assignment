FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/vehicle-data-generator

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

ENV mode="start-broadcast"

CMD ["sh", "-c", "npm run ${mode}"]