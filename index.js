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
let path = require('path');

//set ports - environment variable OR localhost 5000
app.set('port', (process.env.PORT || 5000));

//use json parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/**
 * test functions
 */
app.get('/', function (req, res){
    res.send('Hi!')
});
app.get('/pull', function(req, res){
    res.send('Hello there. ')
});

/**
 * when webhook posts to /pull, log it
 */
app.post('/pull', function(req, res){
    let data = req.body;

    console.log('/pull was activated.');

    try{
        console.log('A pull event happened!');
        pullEventReceived(data);
    }
    catch (e) {
        console.log("Webhook received unknown event: ", e);
    }

    //assume all went well
    //you must send back a 200 within 20 seconds, otherwise it'll time out
    res.sendStatus(200);

});

//add server
app.listen(app.get('port'), function(){
    //create log for heroku
    console.log('running on port', app.get('port'))
});

/**
 * Processes each received pull event
 * @param event
 */
function pullEventReceived(event) {


    console.log("Pull event logged. ");
    console.log(event);
}

