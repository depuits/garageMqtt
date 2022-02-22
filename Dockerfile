FROM node:16-alpine

# Create app directory
WORKDIR /usr/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY interface/package*.json ./

RUN npm install

# Bundle app source
ADD interface .

EXPOSE 1991
CMD [ "node", "index.js" ]
