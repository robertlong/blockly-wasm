require("./generators/assemblyscript");

var blocklyArea = document.getElementById('blocklyArea');
var blocklyDiv = document.getElementById('blocklyDiv');

const workspace = Blockly.inject(blocklyDiv, {
  comments: true,
  collapse: true,
  disable: true,
  grid:
    {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true
    },
  maxBlocks: Infinity,
  media: './media/',
  oneBasedIndex: true,
  readOnly: false,
  scrollbars: true,
  toolbox: document.getElementById('toolbox'),
  toolboxOptions:
    {
      color: true,
      inverted: true
    },
  zoom:
    {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 4,
      minScale: .25,
      scaleSpeed: 1.1
    }
});

window.addEventListener('resize', () => {
  Blockly.svgResize(workspace);
}, false);

Blockly.svgResize(workspace);


const initialWorkspaceState = window.localStorage.getItem("workspaceState");

if (initialWorkspaceState) {
  var xml = Blockly.Xml.textToDom(initialWorkspaceState);
  Blockly.Xml.domToWorkspace(xml, workspace);
}

let previousState = initialWorkspaceState;

workspace.addChangeListener(() => {
  var xmlDom = Blockly.Xml.workspaceToDom(workspace);
  var xmlText = Blockly.Xml.domToText(xmlDom);

  if (previousState !== xmlText) {
    window.localStorage.setItem("workspaceState", xmlText);
  }

  previousState = xmlText;
});

window.addEventListener('unload', () => {
  var xmlDom = Blockly.Xml.workspaceToDom(workspace);
  var xmlText = Blockly.Xml.domToText(xmlDom);
  window.localStorage.setItem("workspaceState", xmlText);
}, false);

const asc = require("assemblyscript/dist/asc");

async function run() {
  document.getElementById("console-output").innerText = "";

  const code = Blockly.AssemblyScript.workspaceToCode(workspace);

  document.getElementById("as-output").innerText = code;

  const { binary, text, stderr, stdout } = asc.compileString(code);

  const textDecoder = new TextDecoder();

  if (stdout.length > 0) {
    const stdoutArgs = stdout.map(buffer => textDecoder.decode(buffer));
    console.log(...stdoutArgs);
  }
  

  if (stderr.length > 0) {
    const stderrArgs = stderr.map(buffer => textDecoder.decode(buffer));
    console.error(...stderrArgs);
  }

  if (text) {
    document.getElementById("wat-output").innerText = text;
  }

  if (binary) {
    const wasmModule = await WebAssembly.compile(binary);

    let instance = null;
    let exports = null;

    const hasBigInt64 = typeof BigUint64Array !== "undefined";
    let mem, I8, U8, I16, U16, I32, U32, F32, F64, I64, U64;

    const checkMem = () => {
      if (mem !== exports.memory.buffer) {
        mem = exports.memory.buffer;
        I8 = new Int8Array(mem);
        U8 = new Uint8Array(mem);
        I16 = new Int16Array(mem);
        U16 = new Uint16Array(mem);
        I32 = new Int32Array(mem);
        U32 = new Uint32Array(mem);
        if (hasBigInt64) {
            I64 = new BigInt64Array(mem);
            U64 = new BigUint64Array(mem);
        }
        F32 = new Float32Array(mem);
        F64 = new Float64Array(mem);
      }
    }

    const getString = (ptr) => {
      checkMem();
      const dataLength = U32[ptr >>> 2];
      let dataOffset = (ptr + 4) >>> 1;
      let dataRemain = dataLength;
      const parts = [];
      const chunkSize = 1024;
      while (dataRemain > chunkSize) {
          let last = U16[dataOffset + chunkSize - 1];
          let size = last >= 0xD800 && last < 0xDC00 ? chunkSize - 1 : chunkSize;
          let part = U16.subarray(dataOffset, dataOffset += size);
          parts.push(String.fromCharCode.apply(String, part));
          dataRemain -= size;
      }
      return parts.join("") + String.fromCharCode.apply(String, U16.subarray(dataOffset, dataOffset + dataRemain));
    }

    instance = await WebAssembly.instantiate(wasmModule, {
      Math,
      env: {
        memory: new WebAssembly.Memory({ initial: 10 }),
        trace: function(msg, n) {
          const message = "trace: " + getString(msg) + (n ? " " : "") + Array.prototype.slice.call(arguments, 2, 2 + n).join(", ");
          const consoleOutputEl = document.getElementById("console-output");
          consoleOutputEl.innerText = consoleOutputEl.innerText + message + "\n";
        },
        abort: function(msg, file, line, column) {
          console.error("abort: " + getString(msg) + " at " + getString(file) + ":" + line + ":" + column);
        }
      }
    });

    exports = instance.exports;
    exports.main();
  }
}

document.getElementById("run-btn").addEventListener("click", run);
