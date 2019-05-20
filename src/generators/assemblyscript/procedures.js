/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.AssemblyScript.procedures');

goog.require('Blockly.AssemblyScript');


Blockly.AssemblyScript['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.AssemblyScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.AssemblyScript.statementToCode(block, 'STACK');
  if (Blockly.AssemblyScript.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.AssemblyScript.prefixLines(
        Blockly.AssemblyScript.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), Blockly.AssemblyScript.INDENT) + branch;
  }
  if (Blockly.AssemblyScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.AssemblyScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.AssemblyScript.valueToCode(block, 'RETURN',
      Blockly.AssemblyScript.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.AssemblyScript.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AssemblyScript.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.AssemblyScript.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.AssemblyScript.definitions_['%' + funcName] = code;
  
  return null;
};

Blockly.AssemblyScript['procedures_defnoreturn'] = function(block) {
  // Define a procedure with no return value.
  var funcName = Blockly.AssemblyScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  
  var branch = Blockly.AssemblyScript.statementToCode(block, 'STACK');
  
  if (Blockly.AssemblyScript.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.

    branch = Blockly.AssemblyScript.prefixLines(
      Blockly.AssemblyScript.STATEMENT_PREFIX.replace(/%1/g, '\'' + id + '\''), Blockly.AssemblyScript.INDENT
    ) + branch;
  }

  if (Blockly.AssemblyScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.AssemblyScript.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + block.id + '\'') + branch;
  }

  var args = [];
  
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AssemblyScript.variableDB_.getName(block.arguments_[i], Blockly.Variables.NAME_TYPE);
  }

  var code = 'function ' + funcName + '(' + args.join(', ') + '): void {\n' + branch + '}';

  code = Blockly.AssemblyScript.scrub_(block, code);

  // Add % so as not to collide with helper functions in definitions list.
  Blockly.AssemblyScript.definitions_['%' + funcName] = code;
  
  return null;
};

Blockly.AssemblyScript['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.AssemblyScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AssemblyScript.valueToCode(block, 'ARG' + i,
        Blockly.AssemblyScript.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.AssemblyScript.ORDER_FUNCTION_CALL];
};

Blockly.AssemblyScript['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.AssemblyScript.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AssemblyScript.valueToCode(block, 'ARG' + i,
        Blockly.AssemblyScript.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.AssemblyScript['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.AssemblyScript.valueToCode(block, 'CONDITION',
      Blockly.AssemblyScript.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.AssemblyScript.valueToCode(block, 'VALUE',
        Blockly.AssemblyScript.ORDER_NONE) || 'null';
    code += Blockly.AssemblyScript.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.AssemblyScript.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
