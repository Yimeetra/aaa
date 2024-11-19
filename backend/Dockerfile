FROM node:19-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .
RUN apk update && apk add chromium

RUN npm install

ENTRYPOINT [ "npm", "start" ]