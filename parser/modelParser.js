/**
 * Created by jihwchoi on 2016-11-15.
 */
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var Enums = require('../data/Enums');
var mapper = require('../data/mapper');

var serviceParser = require('./serviceParser.js');

var getServices = ['getCartService', 'getCouponService', 'getDiscountService', 'getItemService', 'getMemberService', 'getOrderService', 'getPaymentService', 'getShippingService'];

var models = [];
var services = [];

var result = {};

//var ast = esprima.parse(fs.readFileSync('./sample/sample.code', 'utf-8'), { loc: false });
module.exports = exports = {};


/**
 * todo: named prototype으로 바꿀까?
 * @param value
 * @returns {object}
 */
exports.getModelParseResult = function (value) {
    result = {
        name: null,
        methods: []
    };

    const modelFolder = '../ESG.OD.Nova_FE_Mobile/server/models/';
    const files = fs.readdirSync(modelFolder);

    files.some(function (file) {
        var fileName = file.substr(0, file.length - 3);
        var subValue = value.substr(value.lastIndexOf('/') + 1, value.length);
        if (subValue === fileName) {
            result.name = fileName;
            parseModel(fileName + '.js');
        }

        if (value === 'cartitems')
            console.log('jihwchoi ' + file);
    });
/*
    console.log('model parse result');
    console.log(JSON.stringify(result));*/

    result.methods = result.methods.filter(function (method) {
        return method.called.length > 0;
    });
    return result;
};

function parseModel (filePath) {
    //../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/order.js
    var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/models/' + filePath, 'utf-8'));

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            //console.log(JSON.stringify(node));
            switch (node.type) {
                case 'AssignmentExpression':
                    AssignmentExpressionSearch(node);
                    //this.skip();
                    break;
                case 'VariableDeclarator':
                    VariableDeclaratorSearch(node);
                    this.skip();
                    break;
                case 'MemberExpression':
                    MemberExpressionSearch(node, parent);
                    this.skip();
                    break;
            }
        }
    });
}

function isCallByRequire(node) {
    return node.left.object && node.left.object.name === service;
}

function isCallByPrototype(node) {
    return node.left.type === 'MemberExpression' &&
        node.left.object.type === 'MemberExpression' &&
        node.left.object.property.name === 'prototype';
}

function isCallByExports(node) {
    return node.left.type === 'MemberExpression' &&
        node.left.object.type === 'Identifier' &&
        node.left.object.name === 'exports';
}

function AssignmentExpressionSearch(node) {
    //console.log(JSON.stringify(node));
    if (isCallByExports(node)) {
        result.methods.push({
         name: node.left.property.name,
         called: []
         });
        //console.log('called by exports ' + node.left.property.name);
    }
}

function VariableDeclaratorSearch(node) {
    //console.log(JSON.stringify(node));
    if (node.init && node.init.callee && node.init.callee.name === 'require') {

        if (node.init.arguments[0].value.indexOf('/models/') !== -1) {
            models.push(node.id.name);
        } else if (node.init.arguments[0].value.indexOf('/services/') !== -1) {
            services.push(node.id.name);
        }
    }
}

function MemberExpressionSearch(node, parent) {
    var idx = result.methods.length - 1;

    if (isCallByServiceName(node)) {
        //console.log('service ' + node.object.name + ',' + node.property.name);
        var service = mapper.getServiceMapper(node.object.name);
        if (service) {
            result.methods[idx].called.push({
                object: node.object.name,
                name: node.property.name,
                type: 'serviceName',
                domain: mapper.getServiceMapper(node.object.name).domain
            });
        }
    } else if (isServiceCallByR(node)) {
        //console.log('R ' + JSON.stringify(node));
        var service = mapper.getServiceMapper(node.object.callee.property.name);

        if (service) {
            result.methods[idx].called.push({
                object: node.object.callee.property.name,
                name: node.property.name,
                type: 'R',
                domain: mapper.getServiceMapper(node.object.callee.property.name).domain
            });
        }
    } else if (isServiceCallByModel(node)) {
        //console.log('model ' + JSON.stringify(node));
        //console.log('model ' + node.object.name + ',' + node.property.name);
            /*result.methods[idx].called.push({
                object: node.object.name,
                name: node.property.name,
                type: 'model',
                domain: 'not yet'
            });*/
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