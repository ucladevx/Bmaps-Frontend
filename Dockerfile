# https://medium.com/@avatsaev/create-efficient-angular-docker-images-with-multi-stage-builds-907e2be3008d
### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:10-alpine as builder

LABEL maintainer="hak7alp@gmail.com, wfehrnstrom@gmail.com, kwijaya@gmail.com"

ARG OPTIMIZE_BUILD=1

# Set . to /usr/app/
WORKDIR /usr/app/

COPY package.json yarn.lock ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
## Necessary for bundling python, make, and g++ tools under the name .gyp, using it for yarn install,
## and then removing .gyp at the end of the install process.
RUN yarn install
RUN mkdir /usr/app/ng-app && cp -R ./node_modules ./ng-app

WORKDIR /usr/app/ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder.
# If this is a test build, then don't do optimizations.
RUN if [ $OPTIMIZE_BUILD -eq 1 ]; then $(npm bin)/ng build --prod --build-optimizer --aot --extra-webpack-config webpack.extra.js ;\
    else $(npm bin)/ng build --prod --aot --extra-webpack-config webpack.extra.js ;\
    fi


### STAGE 2: Setup ###

FROM nginx:1.13.3-alpine

## Copy our default nginx config
COPY nginx/conf/nginx.conf /etc/nginx

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /usr/app/ng-app/dist /usr/share/nginx/html

# daemon off sets global configuration option that runs nginx in foreground for this container
CMD ["nginx", "-g", "daemon off;"]
