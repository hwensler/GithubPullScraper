/**
 * Created by: HeatherWenslerNolis
 * 08/23/2017
 */

"use strict";

//npm packages
let bodyParser = require('body-parser');
let request = require('request');
let express = require('express');
let app = express();

//set ports - environment variable OR localhost 5000
app.set('port', (process.env.PORT || 5000));

//use json parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/**
 * Processes each received pull event
 * @param event
 */
function pullEventReceived(event) {

    //store information about this event
    let thisEvent = JSON.stringify(event);

    console.log("Pull event received. ");
    console.log(thisEvent);
}

