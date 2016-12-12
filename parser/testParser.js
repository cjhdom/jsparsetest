/**
 * Created by jihwchoi on 2016-11-18.
 */
/**
 * Created by jihwchoi on 2016-11-15.
 */
var esprima = require('esprima');
var estraverse = require('estraverse');

var fs = require('fs');

exports = module.exports = {};

exports.parseTest = function (filePath) {
    //../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/order.js
    var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/routes/ko/order/index.js', 'utf-8'));
    //var ast = esprima.parse(fs.readFileSync('../ESG.OD.Nova_FE_Mobile/server/routes/ko/' + filePath, 'utf-8'));

    estraverse.traverse(ast, {
        enter: function (node, parent) {


            switch(node.type) {
                case 'CallExpression':
                    console.log(JSON.stringify(node));
                    break;

            }
            if (node.type !== 'Program') {
                //this.skip();
            }
            //this.skip();
            /*switch (node.type) {
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
            }*/
        }
    });

    //console.log(JSON.stringify(result));
    //return result;
};

