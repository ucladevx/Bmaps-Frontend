import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'

//COMPONENTs
import Navbar from './components/header/navbar';
import MainDisplay from './components/mainDisplay/mainDisplay'
import EventObj from './components/mainDisplay/sidebar/event'


const App = () =>{
    return (
        <BrowserRouter>
            <div>
                <Route path="/" component={MainDisplay} />
                <Route path="/event:eventid" component={EventObj} />
            </div>
        </BrowserRouter>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
