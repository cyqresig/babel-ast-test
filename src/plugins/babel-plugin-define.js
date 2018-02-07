/**
 * @since 2017-10-14 13:06
 * @author chenyiqin
 */

// identifier
module.exports = function(babel) {
    var t = babel.types;
    return {
        visitor: {
            Identifier: function(path, options) {
                var node = path.node;
                var name = node.name;
                var opts = options.opts;
                var defineKeys = Object.keys(opts);

                defineKeys.forEach(function(defineKey) {
                    var defineValue;

                    if (name === defineKey) {
                        defineValue = opts[defineKey];
                        path.replaceWith(
                            t.stringLiteral(defineValue),
                        );
                    }
                });
            }
        }
    };
};
