FROM node:16.18.0-alpine3.16

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN cd ..

COPY . .

CMD ["npm", "start"]

