# Mappening-Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.0.

## Overview
A single platform for events across campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising. 

## Built With
- nginx (Port 80): Server for static files, forwards requests to backend and serves results
- Mapbox: Open source mapping platform for custom designed maps
- Angular4: Front-end web application platform
- AWS EC2/Elastic Container Service for deployment

## Setting Up the Environment
- Download [Docker](https://www.docker.com) and [Docker-Compose](https://github.com/docker/compose/releases) release 1.16.1.  
- Clone this repository 
  - `git clone https://github.com/ucladevx/Mappening-Frontend.git`  
- Install necessary packages
  - Install yarn with `brew install yarn`
  - Import node modules with command `yarn` or `yarn install`
    - Uses `package.json` for installing packages
    - Install specific packages as needed with `yarn add <package>`
    - Install Angular CLI with `yarn global add @angular/cli`
  - NOTE: Commit/keep lock files as they change. `package.json` defines the intended versions of dependencies while the lock files keep track of the most recently used versions.

## How to Push Image to AWS ECS
- Enter the repository
  - `cd Mappening-Frontend`
- Login, build, and push image to AWS
  - `make push`

## How to Run Frontend Locally
- Run a dev server with `make dev`
  - Navigate to http://localhost:4200/ 
  - The app will automatically reload if you change any of the source files.
- Build and run docker container locally
  - `make dev-docker`
  - Navigate to `http://localhost:8080`

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## More Info
- Checkout the [backend](https://github.com/ucladevx/Mappening-Backend) repository
- Checkout the [deployment](https://github.com/ucladevx/Mappening-Deployment) repository
  - Contains instructions for local development and production
