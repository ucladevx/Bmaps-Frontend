# https://medium.com/@avatsaev/create-efficient-angular-docker-images-with-multi-stage-builds-907e2be3008d
### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:10-alpine as builder

# Set . to /usr/app/
WORKDIR /usr/app/

COPY package.json yarn.lock ./

# RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN yarn install && yarn upgrade && mkdir /usr/app/ng-app && cp -R ./node_modules ./ng-app

WORKDIR /usr/app/ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --prod --build-optimizer


### STAGE 2: Setup ###

FROM nginx:1.13.3-alpine

## Copy our default nginx config
COPY nginx/conf/nginx.conf /etc/nginx

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /usr/app/ng-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
