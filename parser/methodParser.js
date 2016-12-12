/**
 * Created by jihwchoi on 2016-11-15.
 */
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var Enums = require('../data/Enums');
var mapper = require('../data/mapper');

var _ = require('lodash');

//var get_order_funcs = ['get_order_step0', 'get_order_step1', 'get_order_step2', 'get_order_step3'];
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
                    //this.skip();
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

    //console.log(JSON.stringify(result));
    return result;
};

///////////////////////////////////////////////////////////////////////////////
// 정의 찾기
///////////////////////////////////////////////////////////////////////////////

function VariableDeclaratorSearch(node) {
    if (node.init && node.init.callee && node.init.callee.name === 'require') {
        //console.log(JSON.stringify(node));
        if (node.init.arguments[0].value.indexOf('/models/') !== -1) {
            var value = node.init.arguments[0].value;
            var currentModel = require('./modelParser').getModelParseResult(value.toLowerCase());
            if (currentModel.name && currentModel.methods.length > 0) {
                models.push(currentModel);
            }
        } else if (node.init.arguments[0].value.indexOf('/services/') !== -1) {
            services.push(node.id.name);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// 함수 찾기
///////////////////////////////////////////////////////////////////////////////

function AssignmentExpression(node) {
    if (node.left.object && node.left.object.name === 'exports') {
        result.push({
            name: node.left.property.name,
            uses: []
        });
        console.log('in ' + node.left.property.name);
    }
}

function FunctionDeclarationSearch(node) {
    if (node.id && node.id.type === 'Identifier') {
        console.log('in ' + node.id.name);
        result.push({
            name: node.id.name,
            uses: []
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// 메소드 찾기
///////////////////////////////////////////////////////////////////////////////

function MemberExpressionSearch(node, parent) {
    if (result.length > 0) {
        var idx = result.length - 1;
        //console.log(JSON.stringify(node));
        if (isCallByServiceName(node)) {
            //console.log('service ' + node.object.name + ',' + node.property.name);
            var service = mapper.getServiceMapper(node.object.name);

            if (service) {
                result[idx].uses.push({
                    name: node.object.name,
                    method: node.property.name,
                    type: 'serviceName',
                    domain: service.domain
                });

                console.log(JSON.stringify(result[idx].uses[result[idx].uses.length - 1]));
            }
        } else if (isServiceCallByR(node)) {
            //console.log('R ' + node.object.callee.property.name + ',' + node.property.name);
            var service = mapper.getServiceMapper(node.object.callee.property.name);

            if (service) {
                result[idx].uses.push({
                    name: node.object.callee.property.name,
                    method: node.property.name,
                    type: 'R',
                    domain: mapper.getServiceMapper(node.object.callee.property.name).domain
                });
                console.log(JSON.stringify(result[idx].uses[result[idx].uses.length - 1]));
            }
        } else if (models.length > 0) {
            var model = getServiceModel(node);

            if (model) {
                //console.log('model ' + JSON.stringify(model));
                //console.log('finding ' + node.property.name);
                //console.log('model ' + node.object.name + ',' + node.property.name);


                var calledModelMethods = _.find(model.methods, {name: node.property.name});

                if (typeof calledModelMethods !== 'undefined') {
                    calledModelMethods.called.forEach(function (method) {
                        console.log('idx ' + idx);
                        console.log(JSON.stringify(method));
                        result[idx].uses.push({
                            name: method.object,
                            method: method.name,
                            type: method.type,
                            domain: method.domain
                        });

                        console.log(JSON.stringify(result[idx].uses[result[idx].uses.length - 1]));
                    });
                }
            }
        }

        /* else {
         return false;
         }

         console.log(JSON.stringify(node));*/
    }
}

///////////////////////////////////////////////////////////////////////////////
// 메소드 찾기 헬퍼
///////////////////////////////////////////////////////////////////////////////
/**
 * R을 통해서 서비스를 호출하는지 확인
 * @param node
 * @returns {boolean}
 */
function isServiceCallByR(node) {
    var callNode = node.object;

    return callNode.type === 'CallExpression' &&
        callNode.callee.object.name === 'R' &&
        getServices.indexOf(callNode.callee.property.name) !== -1;
}

/**
 * Model 참조로 서비스 호출하는지 확인
 * @param node
 * @returns {object}
 */
function getServiceModel(node) {
    if (node.object.type === 'Identifier') {
        var callNode = node.object;
        var modelIdx = models.findIndex(function (model) {
            return model.name.toLowerCase() === callNode.name.toLowerCase();
        });

        if (modelIdx !== -1) {
            return models[modelIdx];
        }
    }

    return null;
}

/**
 * 서비스를 바로 참조하여 서비스 호출하는지 확인
 * @param node
 * @returns {boolean}
 */
function isCallByServiceName(node) {
    return node.object.type === 'Identifier' && (services.indexOf(node.object.name) !== -1);
}