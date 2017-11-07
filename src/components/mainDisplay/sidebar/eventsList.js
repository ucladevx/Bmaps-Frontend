import React from 'react'
import { Link } from 'react-router-dom'

const EventsList = (props) => {


    const list = ({allEvents}) => {
        console.log("haha")
        console.log(allEvents)
        if (allEvents){
            console.log("hehe")
            return allEvents.map((item)=>{
                return (
                    <div>Item</div>
                )
            })
        }

    }
    return (
        <div className="eventsList">
            <h4>Browse the events</h4>
            {list(props)}
            <div>hahah</div>
        </div>
    )
}

export default EventsList;
