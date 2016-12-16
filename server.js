/**
 * Created by Parksubin on 2016-12-15.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
http.post = require('http-post');
var request = require('request');
var session = require('express-session');
var mysql = require('mysql');
var async= require('async');
var os = require('os');

var k;
var b;
var s;
var p;
var test;
var ip ="192.168.0.26";
var cpe_key="94V-0F1-E6"

app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views',__dirname + '/views');

var httpServer=http.createServer(app).listen('3000',function(){
    console.log('서버 실행입니다!!!!');
});

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection',function(socket){

    socket.on('toclient',function (data) {


        console.log(data);
        // console.log(data);
        datax = Number(data.X);
        datay= Number(data.y);
        databri=Number(data.bri);
        //
        // console.log(datax);
        // console.log(datay);



        async.waterfall([

            function(callback){

                request('http://www.meethue.com/api/nupnp', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        info = JSON.parse(body);
                    }
                    callback(null,info[0].internalipaddress);
                });
            },

            function(arg1,callback){
                // console.log(arg1);
                var info=arg1;
                /*console.log("check");
                console.log(datax);
                console.log(datay);*/
                var options = {
                    // url: 'http://192.168.0.19/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/3/state',
                    url: 'http://'+info+'/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2/state',
                    method:"PUT",

                    json : true,
                    header : {
                        "content-type":"application/json",
                    },
                    body:{"xy":[datax,datay],"bri":databri}
                };

                function ss() {}

                request(options,ss);

                callback(null,1);
            },
            function subin (err,data) {
                request('http://192.168.0.2/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        info = JSON.parse(body);
                     // console.log(info);
                    }
                });
            }

        ]);

    });


});


app.get('/test',function (req,res) {
   console.log("cpe test 확인");

    var data = {
        "ip":ip,
        "cpe_key":cpe_key,
        "cpe_os":os.type(),
        "cpe_version":os.release()
    };

    console.log(data);
    res.send(data);
});

app.get('/', function (req, res, next) {

    res.end("asdsadsad");
});


//TODO: WEMO에대한 기기정보 주는 부분(완료)
app.get('/searchwemo', function (req, res, next) {

    var Wemo = require('wemo-client');
    var wemo = new Wemo();

    async.waterfall([

        function(callback){

            wemo.discover(function (deviceInfo){
                console.log("deviceinfo정보");
                console.log(deviceInfo);
               callback(null,deviceInfo)
            });

        },
        function(arg1,callback){
            console.log(arg1);
            var info=arg1;

            callback(null,info);

        },
        function(err,result){
            res.send(err);
        }

    ]);

});


//TODO: HUE에대한 기기정보 주는 부분
app.get('/searchhue', function (req, res, next) {
    
    async.waterfall([

        function(callback){

            request('http://www.meethue.com/api/nupnp', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                }
                callback(null,info[0].internalipaddress);
            });

        },

        function(arg1,callback){
            console.log(arg1);
            var info=arg1;


            request('http://'+info+'/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/config', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var s = JSON.parse(body);
                    // Show the HTML for the Google homepage.
                }
                callback(null,s);
            });
            
        },
        function(err,result){
            res.send(err);
        }
    ]);
});

//TODO: HUE CONTROL
app.get('/huecontrolOn',function (req,res) {
    var state = req.body.hue;
    console.log(state);
    async.waterfall([

        function(callback){

            request('http://www.meethue.com/api/nupnp', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                }
                callback(null,info[0].internalipaddress);
            });
        },

        function(arg1,callback){
            console.log(arg1);
            var info=arg1;

            var options = {
                // url: 'http://192.168.0.19/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/3/state',
                url: 'http://'+info+'/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2/state',
                method:"PUT",

                json : true,
                header : {
                    "content-type":"application/json",
                },
                body:{"on":true}
            };

            function ss() {}

            request(options,ss);

            callback(null,1);
        },
        function subin (err,data) {
            request('http://192.168.0.2/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                    console.log(info.state.on);
                    console.log(info.state.hue);
                    console.log(info.state.sat);
                }
                var a ={
                    "color":info.state.hue,
                    "bright":info.state.sat,
                    "state":info.state.on

                }
                res.send({data:a});
            });
        }
    ]);

});

//TODO: HUE CONTROL
app.get('/huecontrolOff',function (req,res) {
    var state = req.body.hue;
    console.log(state);
    async.waterfall([

        function(callback){

            request('http://www.meethue.com/api/nupnp', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                }
                callback(null,info[0].internalipaddress);
            });
        },

        function(arg1,callback){
            console.log(arg1);
            var info=arg1;

            var options = {
                // url: 'http://192.168.0.19/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/3/state',
                url: 'http://'+info+'/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2/state',
                method:"PUT",

                json : true,
                header : {
                    "content-type":"application/json",
                },
                body:{"on":false}
            };

            function ss() {}

            request(options,ss);

            callback(null,1);
        },
        function subin (err,data) {
            request('http://192.168.0.2/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                    console.log(info.state.on);
                    console.log(info.state.hue);
                    console.log(info.state.sat);
                }

                var a ={
                    "color":info.state.hue,
                    "bright":info.state.sat,
                    "state":info.state.on

                }
                res.send({data:a});
            });
        }

    ]);

});


//TODO: HUE COLOR CONTROL
app.post('/huecolor',function (req,res) {


    var state = req.body.color;
    state = Number(state);
    async.waterfall([

        function(callback){

            request('http://www.meethue.com/api/nupnp', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                }
                callback(null,info[0].internalipaddress);
            });
        },

        function(arg1,callback){
            console.log(arg1);
            var info=arg1;

            var options = {
                // url: 'http://192.168.0.19/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/3/state',
                url: 'http://'+info+'/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2/state',
                method:"PUT",

                json : true,
                header : {
                    "content-type":"application/json",
                },
                body:{"hue":state}
            };

            function ss() {}

            request(options,ss);

            callback(null,1);
        },
        function subin (err,data) {
            request('http://192.168.0.2/api/XIZOy152etSXOyNpcKuOw-xcwkkRRCoCIkaBUk-z/lights/2', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    info = JSON.parse(body);
                    console.log(info.state.on);
                    console.log(info.state.hue);
                    console.log(info.state.sat);
                }
                res.send({"color":info.state.hue,
                    "bright":info.state.sat,
                    "state":info.state.on});
            });
        }

    ]);

});

//TODO: WEMO CONTROL(완료)
app.post('/wemocontrol', function (req, res) {

    var msg = req.body.wemo;

    test = msg;

    console.log("server에서 받은 값:", test);

    var Wemo = require('wemo-client');

    var wemo = new Wemo();


     function foundDevice(device) {

        if (device.deviceType === Wemo.DEVICE_TYPE.Insight) {
            console.log('Wemo Insight Switch found: %s', device.friendlyName);

            var client = this.client(device);

            client.setBinaryState(test, client.getInsightParams(function cb(err, binaryState, instantPower, data) {

                k =instantPower;
                b= binaryState;
                s=data;

                var a ={"instantPower":k,
                        "binaryState":b,
                        "data":s};

                res.send(a);

            }));

        }
    }

    wemo.discover(foundDevice);
});

