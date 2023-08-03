FROM node:16

WORKDIR /dotCards
COPY package.json .
RUN npm install
COPY . .
CMD npm run test