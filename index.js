var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



//TODO: WEMO에대한 기기정보 주는 부분
router.get('/searchwemo', function (req, res, next) {

  var Wemo = require('wemo-client');
  var wemo = new Wemo();
  wemo.discover(function (deviceInfo) {

    res.send(deviceInfo);
  });

});

//TODO: WEMO CONTROL
router.post('/wemocontrol', function (req, res) {

  var msg = req.body.wemo;

  test = msg;

  console.log("Spring server에서 받은 값:", test);

  var Wemo = require('wemo-client');

  var wemo = new Wemo();

  wemo.discover(function (deviceInfo) {

    var client = wemo.client(deviceInfo);


    client.setBinaryState(test, client.getInsightParams(function cb(err, binaryState, instantPower, data) {

      //TODO:전력량 값
      // console.log(instantPower);
      // //TODO:상태 값
      // console.log(binaryState);
      // //TODO:데이터 값
      // console.log(data);

      k = instantPower;
      b= binaryState;
      s=data;

      console.log(k);
      //TODO:상태 값
      console.log(b);
      //TODO:데이터 값
      console.log(s);

      res.send({instantpower:k,state:test});

    }));

  });

});


module.exports = router;
