# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`

## Built With
* Mapbox: Open source mapping platform for custom designed maps
* Node: Javascript runtime built on Chrome

## How To Run
* `cd` to the repository.
* `npm install` to install packages.

* Run [Mappening-Backend] (https://github.com/ucladevx/Mappening-Backend)
    * Navigate to http://localhost:5000/api/events
* OR
* Run static json server from this repo (testing purposes)
    * Modify public/js/main.js
      * `$.getJSON("http://localhost:3004/events", function(data)`
    * Run`json-server --watch events.json --port 3004`
    * Navigate to http://localhost:3004/events


* Run app `nodemon`
    * Navigate to http://localhost:8000
