FROM node:alpine as build

COPY . .
RUN npm install

ENTRYPOINT [ "npm", "start" ] 
