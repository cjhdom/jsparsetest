var express = require('express');
var router = express.Router();

var escope = require('escope');
var estraverse = require('estraverse');
var esprima = require('esprima');
var fs = require('fs');
var Enums = require('../data/Enums');

var scopeChain = [];
var assignments = [];

var ast = esprima.parse(fs.readFileSync('./routes/index.js', 'utf-8'), { loc: true });
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
  if (createsNewScope(node)) {
    currentScope = scopeManager.acquire(node);
    //console.log(currentScope);
    console.log(node);
  }

/*  if (node.type === 'VariableDeclarator'){
    var currentScope = scopeChain[scopeChain.length - 1];
    currentScope.push(node.id.name);
  }

  if (node.type === 'AssignmentExpression'){
    assignments.push(node);
  }*/
}

function leave(node) {
  if (createsNewScope(node)) {
    currentScope = currentScope.upper;
  }
}

function isVarDefined(varname, scopeChain) {
  for (var i = 0; i < scopeChain.length; i++) {
    var scope = scopeChain[i];
    if (scope.indexOf(varname) !== -1) {
      return true;
    }
  }
  return false;
}

function checkForLeaks(assignments, scopeChain) {
  for (var i = 0; i < assignments.length; i++) {
    var assignment = assignments[i];
    var varName = assignment.left.name;
    if (!isVarDefined(varName, scopeChain)) {
      console.log(JSON.stringify(assignment));
      console.log('Leaked global', varName,
          'on line', assignment.loc.start.line);
    }
  }
}

function createsNewScope(node) {
  return node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression'; /*||
      node.type === 'Program';*/
}

function isWhatIamLookingFor(node) {

}

module.exports = router;
