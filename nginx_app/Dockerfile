# start with a lightweight linux image
FROM alpine:3.6

# add necessary packages
RUN apk update && \
    apk upgrade && \
    apk add bash curl nginx && \
    rm -rf /var/cache/apk/*

# set the working directory and copy source files
WORKDIR /app
COPY . .

# copy data to app location
RUN mkdir -p /run/nginx
COPY ./conf/nginx.conf /etc/nginx

# open a port and start the server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
