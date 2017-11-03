import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'

//COMPONENTs
// import MapDisplay from './components/mapDisplay'
import MapDisplay from './mapDisplay';
import EventsList from './eventsList'
const URL_ARTISTS = 'http://localhost:5000/events'

class MainDisplay extends Component {

    constructor(props){
        super(props);

        this.state = {
            events:''
        }
    }

    componentDidMount(){
        fetch(URL_ARTISTS,{
            method:'GET'
        })
        .then(response => response.json())
        .then(json => {
            console.log(json)
        })
    }

    render() {
        return(
            <div>
                <EventsList></EventsList>
                <BrowserRouter>
                    <div>
                        <Route exact path="/" component={MapDisplay}/>
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}

export default MainDisplay;
