var express = require('express');
var esrecurse = require('esrecurse');
var router = express.Router();

var escope = require('escope');
var estraverse = require('estraverse');
var esprima = require('esprima');
var fs = require('fs');
var Enums = require('../data/Enums');

var scopeChain = [];
var assignments = [];

var get_order_funcs = ['get_order_step0', 'get_order_step1', 'get_order_step2', 'get_order_step3'];
var services = ['cartService', 'couponService', 'discountService', 'itemService', 'memberService', 'orderService', 'paymentService', 'shippingService'];

//var ast = esprima.parse(fs.readFileSync('./sample/sample.code', 'utf-8'), { loc: false });
var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/order.js', 'utf-8'), { loc: true });
var scopeManager = escope.analyze(ast);
var currentScope = scopeManager.acquire(ast);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json();
});

estraverse.traverse(ast, {
  enter: enter,
  leave: leave
});

function enter(node) {
  try {
    if (get_order_funcs.indexOf(node.id.name) !== -1) {
      console.log('in ' + node.id.name);
      var bodies = node.body.body;
      bodies.forEach(function (body) {
        if (body.type === 'ExpressionStatement') {
            esrecurse.visit(body, {
              MemberExpression: function(node) {
                if (node.object.type === 'Identifier' && services.indexOf(node.object.name) !== -1) {
                  this.visit(node.left);
                  console.log(JSON.stringify(node));
                  this.visit(node.right);
                }
              }
            });
          }
        });
      }
    }
  catch (e) {
    //console.log(e.stack);
  }
  //}
}

function leave(node) {
  /*if (createsNewScope(node)) {
    currentScope = currentScope.upper;
  }*/
}

module.exports = router;
