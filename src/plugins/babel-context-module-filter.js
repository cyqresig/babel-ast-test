/**
 * @since 2017-10-14 13:06
 * @author chenyiqin
 */

module.exports = function(babel) {
    var t = babel.types;
    return {
        visitor: {
            CallExpression: function(path, settings) {
                if (path.node.arguments &&
                    path.node.arguments.length === 3 &&
                    path.node.callee &&
                    path.node.callee.object &&
                    path.node.callee.object.name === 'require' &&
                    path.node.callee.property &&
                    path.node.callee.property.name === 'context' &&
                    path.node.arguments[0].value === '../mock-server/api' &&
                    path.node.arguments[1].value === true &&
                    path.node.arguments[2].pattern === '\\.js(on)?$') {
                    path.replaceWith(
                        // t.callExpression(
                        //     t.memberExpression(
                                t.functionExpression(null, [], t.blockStatement([])),
                            // ),
                        // ),
                    );
                }
            }
        }
    };
};
