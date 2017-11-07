# Mappening-Frontend

## Overview
A single platform for events all over campus. Mappening helps raise awareness of events by aggregating event information from various sources of advertising.

## Prerequisites
Clone this repository with `git clone https://github.com/ucladevx/Mappening-Frontend.git`

## Built With
* React: Javascript library for building user interfaces
* Node: Javascript runtime built on Chrome

## How To Run
* `cd` to the repository.
* `npm install` to install packages. Install any necessary peer dependencies.

* Run [Mappening-Backend] (https://github.com/ucladevx/Mappening-Backend)
    * Navigate to http://localhost:5000/api/events
* OR
* Run fake json server in case backend doesn't appear to work (testing purposes)
    * Modify src/components/mainDisplay/mainDisplay.js:
      * `const URL_EVENTS = "http://localhost:3004/artists"`
    * Run`json-server --watch db.json --port 3004`
    * Navigate to http://localhost:3004/artists


* Run react app `npm start`
    * Navigate to http://localhost:8000
