FROM node:21-alpine3.18

RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN npm install

COPY . . 

EXPOSE 2002

CMD [ "npm", "run", "dev"]