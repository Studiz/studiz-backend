FROM node:lts-alpine as build-stage
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY package*.json ./
RUN npm install 
COPY . .
EXPOSE 9091
CMD ["npm","run","dev"]

