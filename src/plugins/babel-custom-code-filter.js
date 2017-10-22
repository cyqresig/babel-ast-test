/**
 * @since 2017-10-14 13:06
 * @author chenyiqin
 */

// code-variable
// module.exports = function(babel) {
//     var t = babel.types;
//     return {
//         visitor: {
//             VariableDeclarator: function(path, options) {
//                 const node = path.node;
//                 if (node.id.name === 'a' && node.init.value === 1) {
//                     node.init.value = 2;
//                 } else if (node.id.name === 'b' && node.init.value === 2) {
//                     node.init.value = 1;
//                 }
//             }
//         }
//     };
// };

// callExpression
module.exports = function(babel) {
    var t = babel.types;
    return {
        visitor: {
            CallExpression: function(path, options) {
                const node = path.node;
                const arguments = node.arguments;
                const callee = node.callee;
                if (arguments &&
                    arguments.length === 3 && callee &&
                    callee.object &&
                    callee.object.name === 'require' &&
                    callee.property &&
                    callee.property.name === 'context' &&
                    arguments[0].value === '../mock-server/api' &&
                    arguments[1].value === true &&
                    arguments[2].pattern === '\\.js(on)?$') {
                    path.replaceWith(
                        t.functionExpression(null, [], t.blockStatement([])),
                    );
                }
            }
        }
    };
};
