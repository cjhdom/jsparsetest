var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var _ = require('lodash');

var routes = require('./routes/index');

//var routerParser = require('./parser/methodParser');
//var mapper = require('./data/mapper');
var testParser = require('./parser/testParser');

testParser.parseTest();

var result = {
  name: null,
  methods: null
};



/*var routerResult = routerParser.parseRouter('order/orderComplete.js');
console.log('start!!------------------------------------');
routerResult.forEach(function(method) {
  if (method.uses.length > 0) {
    console.log('in ' + method.name);
    method.uses.forEach(function(usedMethod) {
      var clientMapper = mapper.getClientMapper(usedMethod.name);

      if (clientMapper) {
        //console.log('mapper ' + JSON.stringify(clientMapper));
        //console.log('method ' + JSON.stringify(usedMethod));

        var serviceMethods = _.find(clientMapper.methods, { name: usedMethod.method });

        if (typeof serviceMethods !== 'undefined') {
          serviceMethods.called.forEach(function(serviceMethod) {
            console.log('called ' + serviceMethod.property);
          });
        }
      } else {
        console.log('couldn\'t find definition for ' + JSON.stringify(usedMethod));
      }
    });
  }
});*/



//serviceParser.parseService('/models/coupon.js');
//var result = modelParser.parseModel('/models/shippingaddress.js');






















var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
