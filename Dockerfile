# start with a lightweight linux image
FROM alpine:3.6

# add necessary packages
RUN apk update && \
    apk upgrade && \
    apk add bash 'nodejs-npm<=6.11' nginx make && \
    rm -rf /var/cache/apk/*

# set the working directory and copy source files
WORKDIR /tmp
COPY *.json /tmp/
RUN npm install

COPY static/ /tmp/static
COPY gulpfile.js /tmp
COPY Makefile /tmp
RUN mkdir /app && make files

RUN mkdir -p /run/nginx
COPY nginx/conf/nginx.conf /etc/nginx
COPY static/public /app

# open a port and start the server
CMD ["nginx", "-g", "daemon off;"]
