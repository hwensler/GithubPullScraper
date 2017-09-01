/**
 * Created by: HeatherWenslerNolis
 * 08/23/2017
 */

"use strict";

//npm packages
let bodyParser = require('body-parser');
let request = require('request');
let express = require('express');
let fs = require('fs');
let AWS = require('aws-sdk');
let https = require('https');
let app = express();
let path = require('path');

//heroku enviroment variables
const key = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET;
const token = process.env.OAUTH_TOKEN;  //an oauth token from github

//make token into the proper string for github validation
let oAuthToken = 'token ' + token;

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

    try{
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
 * Processes each received pull event - currently logs entire json
 * @param event
 */
function pullEventReceived(event) {


    console.log("Pull event received. ");

    //only if this event opens a pull request
    if (event.action == 'opened'){
        let repoOwner = event.repository.owner.login;
        let repoName = event.repository.name;
        let pullNumber = event.number;
        let openURL = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/pulls/" + pullNumber + "/files";
        console.log("New pull request opened by " + event.pull_request.user.login + "! ");
        console.log("Repo Owner: " + repoOwner + "\nRepo Name: " + repoName + "\nPull Number: " + pullNumber + "\nGet URL: " + openURL);

        //send get request for more information
        sendGetRequest(openURL);

        //close pull request
        let closeURL = "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/pulls/" + pullNumber;

        //TODO replace - just trying postman code raw

        var options = { method: 'PATCH',
            url: closeURL,
            headers:
                { 'postman-token': '6035eb7c-c5d1-7213-73e8-3a9e4f304b91',
                    'cache-control': 'no-cache',
                    authorization: oAuthToken},
            body: '{\r\n  "state": "close"\r\n}' };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
        //closePull(closeURL);
    }
}

/**
 * Takes a URL, sends a get request, and logs the returned json
 * @param url
 */
function sendGetRequest(url){
    request({
        uri: url,
        method: 'GET',
        headers: {
            //any valid username will work here
            'User-Agent': 'hwensler'
        }
    }, function(error, response, body){
        if (!error && response.statusCode == 200){
            let content = JSON.parse(body);
            console.log(content);

            //iterate over each entry in the body
            content.forEach(function(content){
                let fileName = content.filename;
                let fileURL = content.raw_url;
                console.log("File name: " + fileName + "\nFile URL: " + fileURL);
                console.log("File name: " + fileName + "\nFile URL: " + fileURL);

                // //stream the file
                // let file = fs.createWriteStream(fileName);
                // let request = https.get(fileURL, function(response){
                //     response.pipe(file);
                //     console.log("Streamed " + fileName);
                // });

                // //upload the file
                // let s3object = new AWS.S3({params: {Bucket: bucket, Key: key}});
                // console.log("Attempting to upload a file to s3. ");
                // s3object.upload({Body: file})
                //     .on('httpUploadProgress', function(evt){
                //         console.log(evt);
                //     })
                //     .send(function(err, data){
                //         console.log(err, data)
                //     });
            })
        } else{
            console.error("Unable to complete get request. ");
            //console.error(response);
            console.error(error);
        }

    });
}

function closePull(url) {
    console.log("Attempting to close a pull. ");

    var options = {
        method: 'PATCH',
        url: url,
        headers:
            {
                authoriation: oAuthToken
            },
        body: '{\r\n  "state": "close"\r\n}'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Closed pull request. ");
        }
        else {
            console.error("Unable to complete patch request to close pull. ");
            //console.error(response);
            console.error(error);
        }
    });
}

