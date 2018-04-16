# start with a lightweight linux image
FROM alpine:3.6

# add necessary packages
RUN apk update && \
    apk upgrade && \
    apk add bash 'nodejs-npm<=6.11' nginx make && \
    rm -rf /var/cache/apk/*

COPY package.json package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --prod --build-optimizer

# Copy the configuration file
RUN mkdir -p /run/nginx
COPY nginx/conf/nginx.conf /etc/nginx

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

# open a port and start the server
CMD ["nginx", "-g", "daemon off;"]
