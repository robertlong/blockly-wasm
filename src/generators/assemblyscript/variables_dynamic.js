/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Generating JavaScript for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.AssemblyScript.variablesDynamic');

goog.require('Blockly.AssemblyScript');
goog.require('Blockly.AssemblyScript.variables');


// AssemblyScript is dynamically typed.
Blockly.AssemblyScript['variables_get_dynamic'] =
    Blockly.AssemblyScript['variables_get'];
Blockly.AssemblyScript['variables_set_dynamic'] =
    Blockly.AssemblyScript['variables_set'];
