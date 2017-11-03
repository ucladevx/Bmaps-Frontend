import React from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'; // ES6
import { BrowserRouter, Route } from 'react-router-dom'

//COMPONENTs
import Navbar from './components/navbar';
import MainDisplay from './components/mainDisplay'

const App = () =>{
    return (

        <div>
            <Navbar></Navbar>
            <MainDisplay></MainDisplay>

        </div>
    )
}

ReactDOM.render(<App />, document.getElementById('root'));
