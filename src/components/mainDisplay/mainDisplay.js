import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'

//COMPONENTs
// import MapDisplay from './components/mapDisplay'
import Navbar from './../header/navbar'
import MapDisplay from './map/mapDisplay';
import EventsList from './sidebar/eventsList'
const URL_EVENTS = 'http://localhost:5000/api/events'
 // const URL_EVENTS = 'http://localhost:3004/artists'

class MainDisplay extends Component {

    constructor(props){
        super(props);
        this.state = {
            events:''
        }
    }

    componentDidMount(){
        fetch(URL_EVENTS,{
            method:'GET'
        })
        .then(response => response.json())
        .then(json => {
            this.setState({
                events: json
            })

        })
    }

    render() {
        return(
            <div>
                <Navbar></Navbar>
                <EventsList allEvents={this.state.events}></EventsList>
                <MapDisplay></MapDisplay>
            </div>
        )
    }
}

export default MainDisplay;
