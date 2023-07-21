/*\
--------------------------------------------------------------------------------------------------------------------
Author: Lawrence Jasper
Application Version: v1.0.0
Date: 07/19/23


The purpose of this application is to allow employees to call in sick because of an event.
--------------------------------------------------------------------------------------------------------------------
* */

const port =  80;
const startup = true;
const diagnostic = true;
const ipAddress_diagnostic = true;
const version = 'v1.0.0';
const appName = 'text-in';
const os = require("os");
const self_ip = getIpAddress();

let util                                    = require("util");
const dotenv                                = require( 'dotenv' );
const { MessagingResponse }                 = require('twilio').twiml;
let express                                 = require("express");
let app                                     = express(); // initializing express
let socket                                  = require("socket.io");
let net                                     = require("net");
let path                                    = require("path");
let url                                     = require("url");
let fs                                      = require("fs");
let bodyParser                              = require("body-parser");
let moment                                  = require("moment");
let twilio                                  = require('twilio');
// let accountSid                              = 'AC7cba5dd24e53dd83f1dca1f89cd5db08'; // updated
// let authToken                               = '70c81520232ed09f327d5c388502e451'; // updated

let accountSid                              = 'AC6a2f6fed1a02e981bf452fbfe7d42713'; // updated
let authToken                               = 'd458cfce8cfc5ec9c1d1200e61d53e2e'; // updated
const twilioClient                          = require('twilio')(accountSid, authToken); // updated
const twilioPhone                           = {number: '+18444237981'} // updated

let sender;
let alertRecipients                         = ['+17088603025'];

let employeeList                            = [];
let recipientList                           = [];

let server;
let io;
const envFound                               = dotenv.config();
const employee_list_path                     = 'employees.txt';

console.log(employee_list_path);

let recipients = [
    {number: '+15863824742', nameFirst: 'Cody', nameLast: 'Basham', group: ""},
    {number: '+12483900343', nameFirst: 'Don', nameLast: 'Bernier Jr', group: ""},
    {number: '+12488218015', nameFirst: 'Angelique', nameLast: 'Thomas', group: ""}
];


let employees = [
    {number: '+12488218015', nameFirst: 'Angelique', nameLast: 'Thomas', group: "", status: 'allow'},
    {number: '+12489356956', nameFirst: 'Brandon', nameLast: 'Taucher', group: "", status: 'allow'},
    {number: '+12484621552', nameFirst: 'Brianna', nameLast: 'Clippart', group: "", status: 'allow'},
    {number: '+15863824742', nameFirst: 'Cody', nameLast: 'Basham', group: "", status: 'allow'},
    {number: '+12484825856', nameFirst: 'Deon', nameLast: 'Wright', group: "", status: 'allow'},
    {number: '+12483900343', nameFirst: 'Don', nameLast: 'Bernier Jr', group: "", status: 'allow'},
    {number: '+12489353563', nameFirst: 'Gary', nameLast: 'Williams', group: "", status: 'allow'},
    {number: '+19892808420', nameFirst: 'Greg', nameLast: 'Corneja', group: "", status: 'allow'},
    {number: '+12488218026', nameFirst: 'Jay', nameLast: 'Chaiser', group: "", status: 'allow'},
    {number: '+17088603025', nameFirst: 'John', nameLast: 'Ronk', group: "", status: 'allow'},
    {number: '+15869458588', nameFirst: 'Larry', nameLast: 'Slowik', group: "", status: 'allow'},
    {number: '+12487658528', nameFirst: 'Max', nameLast: 'Schmitt', group: "", status: 'allow'},
    {number: '+12487596450', nameFirst: 'Ryan', nameLast: 'Hamlin', group: "", status: 'allow'},
    {number: '+12484946764', nameFirst: 'Sean', nameLast: 'LeBlanc', group: "", status: 'allow'},
    {number: '+12489171359', nameFirst: 'Tyler', nameLast: 'McDonald', group: "", status: 'allow'},
    {number: '+12488822276', nameFirst: 'Lawrence', nameLast: 'Jasper', group: "", status: 'allow'},
];



try{
    // const res = fs.openSync(employee_list_path, 'r');
    // console.log(res)

}catch (e) {
    console.log(e);
}

if ( envFound.error ) {
    throw new Error( `⚠️  Could not find .env file  ⚠️`);
}


console.log(process.env.TWILIO_PHONE_NUMBER); // twilio phone number
console.log(process.env.PASSCODE); // twilio passcode

server = app.listen(port, function () {

    if(startup){console.log(`${appName} Version: ${version}, Port: ${port}, IP Address: ${self_ip}`)}

    app.use(express.static('public'));

    io = socket(server);

    io.on('connection', (socket) => {

        if(diagnostic){console.log('Socket connected..')}

        socket.on('js', function (data) {
            try{
                let msg = JSON.parse(data);
                let list;

                switch (msg.type) {
                    case 'get_employee_list':

                        list = _getList(`employee`);

                        socket.emit('html', JSON.stringify({type:'employee_list', data: list}))

                        break;
                    case 'get_recipient_list':

                        // list = _getList(`recipient`);
                        //
                        // socket.emit('html', JSON.stringify({type:'recipient_list', data: list}))

                        break;
                    case 'send_text':
                        twilioClient.messages.create({from:twilioPhone.number, to: '+12488822276', body:'larry'})

                        console.log('text sent...')
                        break;
                    case 'add_person':
                        _add_person(msg.data.fName, msg.data.lName, msg.data.phone, msg.data.status, 'employee');
                        console.log(`person added...`);
                        break;
                    default:
                        break;
                }

            }catch (e) {
                console.log(e);
            }
        })
    })

    io.on('disconnect', (e) => {
        if(diagnostic){console.log('Socket disconnected.. (Socket.io)')}
        // log.log('error', error.e.io_disconnect.code, fileName, error.e.io_disconnect.message, false, new Error().stack);
    })
})

// create application/json parser
let jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/sms*', jsonParser, function (request, response) {
    response.sendFile('/sms');
});
app.get('/public/index.html*', urlencodedParser, function (request, response) {
    response.sendFile('/public/index.html');
});

app.post('/sms', urlencodedParser, function(request, response) {

    console.log(`request`);
    console.log(request.body.Body);

    const twiml = new MessagingResponse();

    twiml.message("MADE received your text");

    response.type('text/xml').send(twiml.toString());

    console.log(`response sent...`);

});

// {number: '+15863824742', nameFirst: 'Cody', nameLast: 'Basham', group: ""},
// {number: '+12483900343', nameFirst: 'Don', nameLast: 'Bernier Jr', group: ""},
// {number: '+12488218015', nameFirst: 'Angelique', nameLast: 'Thomas', group: ""},

// fs.writeFileSync(`./employees.txt`, JSON.stringify({number:'', nameFirst: '', nameLast:'', status: ''}));

function _sendResponse(recipient) {
    twilioClient.messages.create({
        body:   "MADE received your text",
        to:     recipient,
        from:   '+14193860148'
    }, function(error, message) {
        if (error) {
            console.log(error);
        }
    });
}
function _sendText(recipients, id, message) {

    let obj                                 = names.find(function(item, index, arr) {
        item.number == id;
    });
    let idName                              = "";

    if (typeof obj !== 'undefined') {
        // the sender name was found in the emplyee list
        idName                              = obj.nameFirst + " " + obj.nameLast;

        recipients.forEach(function(item, index, arr) {
            twilioClient.messages.create({
                body:   "from: " + idName + " \n" + message,
                to:     item.number,
                from:   '+14193860148'
            }, function(error, message) {
                if (error) {
                    console.log(error);
                } else {
//				console.log(message.sid);
                }
            });
        });
    } else {
        // the sender was not found in the employee list
        // so use the phone number is the identifying name
        idName                              = id;

        recipients.forEach(function(item, index, arr) {
            twilioClient.messages.create({
                body:   "from: " + idName + " \n" + message,
                to:     item.number,
                from:   '+14193860148'
            }, function(error, message) {
                if (error) {
                    console.log(error);
                } else {
//				console.log(message.sid);
                }
            })
                .then(function(message) {

                });
        });
    }

    let timestamp                           = moment().format("MMM DD YYYY_~_hh:mm:ss");
    fs.appendFile("employeelog.txt", timestamp + "_~_" + "INFO" + "_~_" + sender + "_~_" + idName + "_~_" + message + "\n", function (error) {
        if (error) { console.log("Error   Can not write to log file"); }
    });
}
// function _getEmployeeList(employeeList) {
//     try {
//         let employee_file = fs.readFileSync("./employees.txt");
//
//         if (employee_file) {
//             let employeeInfo                = employee_file.toString().split('\n'); // split by line...
//             if (employeeInfo.length > 1) {
//                 employeeInfo.forEach(item=> {
//                     let infoList        = item.split('~');
//                     let name, number, status;
//
//                     try { name   = infoList[0].split('=')[1]; } catch (ex) { name   = ""; }
//                     try { number = infoList[1].split('=')[1]; } catch (ex) { number = ""; }
//                     try { status = infoList[2].split('=')[1]; } catch (ex) { status = "allow"; }
//
//                     employeeList.push({
//                         name: name,
//                         number: number,
//                         status: status,
//                     });
//                 });
//             }
//         } else {
//             // do nothing
//         }
//     } catch (e) {
//         console.log(e);
//     }
// }

function _getList(type) {
    try {
        let res;
        switch (type) {
            case 'employee':
                let employee_file = fs.readFileSync("./employees.txt");
                res = JSON.parse(employee_file.toString());
                break;
            case 'recipient':
                let recipient_file = fs.readFileSync("./recipients.txt");
                res = JSON.parse(recipient_file.toString());
                break;
            default:
                break;

        }

        return res;

    } catch (e) {
        console.log(e);
    }
}
function _add_person(fname,lname,number,status,type) {
    try {
        switch (type) {
            case 'employee':
                let string = JSON.stringify({number:number, nameFirst: fname, nameLast:lname, group:'', status: status})
                string = string + ',';
                console.log(string)
                fs.appendFileSync(`./employees.txt`, string);
                console.log(`{number:${number}, nameFirst:${fname}, nameLast:${lname}, group:'', status:${status}}\r\n`)
                console.log(`employee added...`);
                break;
            case 'recipient':
                fs.appendFileSync(`./recipients.txt`, JSON.stringify({number:number, nameFirst: fname, nameLast:lname, group:'', status: status}));
                console.log(`recipient added...`);
                break;
            default:
                break;

        }

    } catch (e) {
        console.log(e);
    }
}
function _remove_person(number, type) {
    try {
        let emp_list = _getList(type); // should return a parsed list....
        emp_list.forEach((item)=>{
            if(item.number === number){
                emp_list.splice(item, 1);
            }else{
                // do nothing...
            }
        })


    } catch (e) {
        console.log(e);
    }
}
function getIpAddress() {
    // log.log('info', error.e.no_error.code, fileName, `getIpAddress function started...`, false, new Error().stack);
    let ip_objs = os.networkInterfaces(); // ip object
    let found_IP = ''; // global
    if(ipAddress_diagnostic){console.log(`Searching for local IPv4 ip address....`)}
    for (let item in ip_objs) { // for each property in the ip object...
        if(ipAddress_diagnostic){console.log(`Searching for ${item} === eth0`)}
        if(item === `eth0` || item === 'enp0s31f6'){
            if(ipAddress_diagnostic){console.log(`Found eth0`)}
            ip_objs[item].forEach(obj=>{
                if(ipAddress_diagnostic){console.log(`Searching for ${obj.family} === IPv4 || 4`)}
                if(obj.family !== undefined){
                    if(obj.family === 4 || obj.family === `IPv4`){ // IPv4
                        if(ipAddress_diagnostic){console.log(`Found local IPv4 ip: ${obj.address}`)}
                        found_IP = obj.address;
                    }
                }
            })
        }
    }
    return found_IP;
}

