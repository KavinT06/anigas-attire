FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY .env.docker.public .env

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
