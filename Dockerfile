FROM node:16.18.0-alpine3.16


WORKDIR /usr/src/app
COPY package.json package-lock.json* ./

RUN apk add --no-cache --virtual .gyp python3 make g++
RUN npm install
RUN npm rebuild bcrypt -build-from-source
RUN apk del make gcc g++ python3


RUN cd ..

COPY . .

CMD ["npm", "start"]



