/**
 * Created by jihwchoi on 2016-11-15.
 */
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var Enums = require('../data/Enums');

var serviceParser = require('./serviceParser.js');

var service = null;
var result = [];

//var ast = esprima.parse(fs.readFileSync('./sample/sample.code', 'utf-8'), { loc: false });
module.exports = exports = {};

exports.parseService = function (filePath) {
    //../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/order.js
    var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/' + filePath, 'utf-8'));

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
                    MemberExpressionSearch(node);
                    this.skip();
                    break;
            }

        }
    });

    console.log(JSON.stringify(result));
    //return result;
};

function isCallByRequire(node) {
    return node.left.object && node.left.object.name === service;
}

function isCallByPrototype(node) {
    return node.left.object.type === 'MemberExpression' &&
        node.left.object.property.name === 'prototype';
}

function isCallByExports(node) {
    return node.left.object.type === 'Identifier' &&
        node.left.object.name === 'exports';
}

function AssignmentExpressionSearch(node) {
    console.log(JSON.stringify(node));
    if (isCallByRequire(node)) {
        /*result.push({
         name: node.left.property.name,
         called: []
         });*/

        console.log('called by require ' + node.left.property.name);

    } else if (isCallByPrototype(node)) {
        /*result.push({
         name: node.left.property.name,
         called: []
         });*/

        console.log('called by prototype ' + node.left.property.name);

    } else if (isCallByExports(node)) {
        result.push({
            name: node.left.property.name,
            called: []
        });

        console.log('called by exports ' + node.left.property.name);

    }
}

function VariableDeclaratorSearch(node) {
    if (node.init.type === 'AssignmentExpression' && node.init.left.object.name === 'module') {
        service = node.id.name;
        //console.log(JSON.stringify(node));
    }
}

function MemberExpressionSearch(node) {
    var idx = result.length - 1;
    //console.log(JSON.stringify(node));
    if (node.object.type === 'Identifier' && node.object.name.toLowerCase().indexOf('client') !== -1) {

        console.log('service ' + node.object.name + ',' + node.property.name);
        /*result[idx].called.push({
         object: node.object.name,
         property: node.property.name
         });*/
    } else if (node.object.type === 'MemberExpression' && node.object.object.type === 'ThisExpression' && node.object.property.name === 'client') {
        console.log('service ' + node.object.property.name + ',' + node.property.name);
    }/* else {
     return false;
     }

     console.log(JSON.stringify(node));*/
}
