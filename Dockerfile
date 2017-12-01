# start with a lightweight linux image
FROM alpine:3.6

# add necessary packages
RUN apk update && \
    apk upgrade && \
    apk add bash 'nodejs-npm<=6.11' && \
    rm -rf /var/cache/apk/*

# install nodemon
RUN npm install -g nodemon

# set the working directory and copy source files
WORKDIR /app
COPY . /app

# open a port and start the server
EXPOSE 8000
CMD ["nodemon"]
