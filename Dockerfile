FROM node:20.9.0

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "src/index.js"]