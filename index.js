var through = require('through-gulp');
var css = require('css')
module.exports = pxToRpx;


var defaultConfig = {
    unit: 'rpx', // 单位
    replaceUnit: 'px', // 被替换的
    screenWidth: 750, // 设计稿屏幕
    wxappScreenWidth: 750, // 微信小程序屏幕
    remPrecision: 6, // 小数精度, 默认6
    forcePxComment: 'px',   // force px comment (default: `px`)
    keepComment: 'no'
};

function pxToRpx(options) {
    var stream = through(function (file, encoding, callback) {
        //如果文件为空，不做任何操作，转入下一个操作，即下一个pipe
        if (file.isNull()) {
            console.log('file is null!');
            this.push(file);
            return callback();
        }
        //插件不支持对stream直接操作，抛出异常
        if (file.isStream()) {
            console.log('file is stream!');
            this.emit('error');
            return callback();
        }
        //内容转换，处理好后，再转成Buffer形式

        options = {
            ...defaultConfig,
            ...options
        }
        var ratio = options.wxappScreenWidth / options.screenWidth;
        var remPrecision = options.remPrecision;

        var content = pxToRpxParse(file.contents.toString('utf-8'), {
            ratio,
            remPrecision,
            ...options
        });
        file.contents = Buffer.from(content, 'utf-8')
        this.push(file);
        callback();
    }, function (callback) {
        // console.log('处理完毕!');
        callback();
    });
    return stream;
}
var pxRegExp = /\b(\d+(\.\d+)?)px\b/;
function pxToRpxParse(data, options) {

    let {
        ratio, remPrecision, unit
    } = options;
    // 转换逻辑
    var astObj = css.parse(data);

    function getValue(val) {

        var reg = new RegExp('([\\d.]*\\d)' + options.replaceUnit, 'g');
        val = val.replace(reg, function (m, p1) {
            let value = p1 * ratio;
            let result = parseFloat(value.toFixed(remPrecision)); // control decimal precision of the calculated value
            return result == 0 ? result : result + unit;
        })

        return val

    }

    function processRules(rules) {
        for (let i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (rule.type === 'media') {
                processRules(rule.rules); // recursive invocation while dealing with media queries
                continue;
            } else if (rule.type === 'keyframes') {
                processRules(rule.keyframes); // recursive invocation while dealing with keyframes
                continue;
            } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
                continue;
            }

            var declarations = rule.declarations;

            for (let j = 0; j < declarations.length; j++) {
                var declaration = declarations[j];
                
                if( declaration.value){
                    declaration.value = declaration.value.toLowerCase();
                }
                
                if (declaration.type === 'declaration' && pxRegExp.test(declaration.value)) {
                    var nextDeclaration = rule.declarations[j + 1];
                    if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
                        if (nextDeclaration.comment.trim() === options.keepComment) { // no transform
                            declarations.splice(j + 1, 1); // delete corresponding comment
                            continue;
                        } else if (nextDeclaration.comment.trim() === options.forcePxComment) { // force px
                            declarations.splice(j + 1, 1);// delete corresponding comment
                            continue
                        }
                    }
                    let a = getValue(declaration.value);
                    declaration.value = a// common transform

                }
            }

        }
    }

    processRules(astObj.stylesheet.rules)
    var cssStr = css.stringify(astObj)
    return cssStr
}