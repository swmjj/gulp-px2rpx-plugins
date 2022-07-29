# gulp-pxtorpx-am

pxtorpx gulp插件
支持通过注释声明px不转换rpx

也可以转换为vw，

### 安装方式
```
npm install https://github.com/swmjj/gulp-px2rpx-plugins.git --save-dev

yarn add https://github.com/swmjj/gulp-px2rpx-plugins.git -D
```


### 使用方式
gulpfile.js
```
var px2rpx = require('gulp-pxtorpx-am')

return src(filePath.scssPath)
        .pipe(px2rpx({
            screenWidth: 750, // 设计稿屏幕, 默认750
            wxappScreenWidth: 750, // 微信小程序屏幕, 默认750
            remPrecision: 6, // 小数精度, 默认6
            forcePxComment: "px",
            keepComment: "no"
        }))
        .pipe(dest(outputPath));

```

业务代码 scss为例
```
// 转换前
.box {
    width: 100px;
    height: 100px;
    border: 1px solid #000;/*px*/
}


// 转换后
.box {
    width: 100rpx;
    height: 100rpx;
    border: 1px solid #000;/*px*/
}

```
