/**
 * Created by jihwchoi on 2016-11-15.
 */
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var Enums = require('../data/Enums');

var get_order_funcs = ['get_order_step0', 'get_order_step1', 'get_order_step2', 'get_order_step3'];
var getServices = ['getCartService', 'getCouponService', 'getDiscountService', 'getItemService', 'getMemberService', 'getOrderService', 'getPaymentService', 'getShippingService'];
var models = [];
var services = [];
var result = [];

//var ast = esprima.parse(fs.readFileSync('./sample/sample.code', 'utf-8'), { loc: false });
module.exports = exports = {};

exports.parseRouter = function (filePath) {
    //../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/order.js
    var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/routes/ko/' + filePath, 'utf-8'));

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            switch (node.type) {
                case 'MemberExpression':
                    MemberExpressionSearch(node, parent);
                    this.skip();
                    break;
                case 'AssignmentExpression':
                    AssignmentExpression(node);
                    this.skip();
                    break;
                case 'VariableDeclarator':
                    VariableDeclaratorSearch(node);
                    this.skip();
                    break;
                case 'FunctionDeclaration':
                    FunctionDeclarationSearch(node);
                    break;
            }
        }
    });

    console.log(JSON.stringify(models));
    console.log(JSON.stringify(services));
    //console.log(JSON.stringify(result));
};


function VariableDeclaratorSearch(node) {
    if (node.init && node.init.callee && node.init.callee.name === 'require') {
        //console.log(JSON.stringify(node));
        if (node.init.arguments[0].value.indexOf('/models/') !== -1) {
            models.push(node.id.name);
        } else if (node.init.arguments[0].value.indexOf('/services/') !== -1) {
            services.push(node.id.name);
        }
    }
}

function AssignmentExpression(node) {
    if (node.left.object && node.left.object.name === 'exports') {
        result.push({
            name: node.left.property.name,
            called: []
        });

        console.log('in ' + node.left.property.name);

        estraverse.traverse(node, {
            enter: function (node, parent) {
                if (node.type === 'MemberExpression') {
                    MemberExpressionSearch(node, parent);
                }
            }
        });
    }
}

function FunctionDeclarationSearch(node) {
    if (node.id && node.id.type === 'Identifier') {
        console.log('in ' + node.id.name);
        result.push({
            name: node.id.name,
            called: []
        });

/*        estraverse.traverse(node.right, {
            enter: function (node, parent) {
                if (node.type === 'MemberExpression') {
                    MemberExpressionSearch(node, parent);
                }
            }
        });*/
    }
}

function MemberExpressionSearch(node, parent) {
    var idx = result.length - 1;

    if (isCallByServiceName(node)) {
        console.log('service ' + node.object.name + ',' + node.property.name);
        result[idx].called.push({
            object: node.object.name,
            property: node.property.name
        });
    } else if (isServiceCallByR(node)) {
        console.log('R ' + node.object.callee.property.name + ',' + node.property.name);
        result[idx].called.push({
            object: node.object.callee.property.name,
            property: node.property.name
        });
    } else if (isServiceCallByModel(node)) {
        console.log('model ' + JSON.stringify(parent));
        //console.log('model ' + node.object.name + ',' + node.property.name);
        result[idx].called.push({
            object: node.object.name,
            property: node.property.name
        });
    }/* else {
     return false;
     }

     console.log(JSON.stringify(node));*/
}

function isServiceCallByR(node) {
    var callNode = node.object;

    return callNode.type === 'CallExpression' &&
        callNode.callee.object.name === 'R' &&
        getServices.indexOf(callNode.callee.property.name) !== -1;
}

function isServiceCallByModel(node) {
    var callNode = node.object;

    return callNode.type === 'Identifier' &&
        models.indexOf(callNode.name) !== -1;
}

function isCallByServiceName(node) {
    return node.object.type === 'Identifier' && (services.indexOf(node.object.name) !== -1);
}