# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`
Have nodemon installed with `npm install -g nodemon`

## Built With
* Mapbox: Open source mapping platform for custom designed maps
* Node.js: Javascript runtime built on Chrome
* Handlebars.js: Templating language that separates view and code
* nginx (Port 80): Server for static files, forwards requests to backend and serves results

## Setting Up the Environment
* Download [Docker](https://www.docker.com) and [Docker-Compose](https://github.com/docker/compose/releases) release 1.16.1.  


## How To Run
* `cd` to the repository.

* Check if backend is already deployed in AWS
    * Navigate to http://52.53.72.98/api/v1/events
    * If not running, run [Mappening-Backend](https://github.com/ucladevx/Mappening-Backend) locally according to the instructions in the README

* Run app
    * In one terminal window:
        * For production: `make build`
        * Navigate to  `localhost`
        * Create container: `make dev`
    * Open a second terminal window:
        * Enter container: `make ash`
        * Every time you make a change: `make files`
