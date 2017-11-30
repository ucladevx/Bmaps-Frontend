# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`
Have nodemon installed with `npm install -g nodemon`

## Built With
* Mapbox: Open source mapping platform for custom designed maps
* Node: Javascript runtime built on Chrome

## How To Run
* `cd` to the repository.
* `npm install` to install packages.

* Check if backend is already deployed in AWS
    * Navigate to http://54.193.65.104/api/v1/events
    * If not running, run [Mappening-Backend](https://github.com/ucladevx/Mappening-Backend) locally according to the instructions in the README
        * Navigate to http://localhost/api/v1/events
        * Modify public/js/main.js
        * `$.getJSON("http://localhost/api/v1/events", function(data)`
* OR
* Run static json server from this repo (testing purposes)
    * Modify public/js/main.js
      * `$.getJSON("http://localhost:3004/events", function(data)`
    * Run`json-server --watch events.json --port 3004`
    * Navigate to http://localhost:3004/events
* Run app with `nodemon`
    * Navigate to http://localhost:8000
