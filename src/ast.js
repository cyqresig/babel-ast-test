/**
 * @since 2017-10-14 10:12
 * @author chenyiqin
 */

const fs = require('fs');
const path = require('path');
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const babel = require('babel-core');
const babelCustomCodeFilterPlugin = require('./plugins/babel-custom-code-filter');

// const filePath = path.join(__dirname, 'code-variable.js');
// const filePath = path.join(__dirname, 'code-undefined.js');
// const filePath = path.join(__dirname, 'code-null.js');
// const filePath = path.join(__dirname, 'code-string.js');
// const filePath = path.join(__dirname, 'code-regex.js');
// const filePath = path.join(__dirname, 'code-function.js');
// const filePath = path.join(__dirname, 'code.js');
// const filePath = path.join(__dirname, 'expressStatement.js');
const filePath = path.join(__dirname, 'callExpression.js');

const code = fs.readFileSync(filePath, {
    encoding: 'utf8',
})
/********** babylon parse code **********/

const ast = babylon.parse(code);

/********** babel transform + plugin **********/

const newAst = babel.transform(code, {
    plugins: [
        [babelCustomCodeFilterPlugin, {
            debug: true,
        }]
    ],
});

console.log('newCode = ');
console.log(newAst.code);

const newFilePath = path.join(__dirname, 'output', 'output.js');
fs.writeFileSync(newFilePath, newAst.code, {
    encoding: 'utf8',
});


