// const fs = require('fs');
const fontmin = require('./fontmin')
const express = require('express');
const bodyParser = require('body-parser');
const findRemoveSync = require('find-remove')
const path = require('path')
const os = require("os")
// 设置可用字体
const fonts = [
    {font: 'SourceHanSerifCN-Medium', name: '思源宋体'},
    {font: 'PangMenZhengDao', name: '庞门正道粗书体'},
    {font: 'RuiziGongfangMeiheiGBK', name: '锐字工房云字库美黑GBK'},
    {font: 'RuiziZhenyanti', name: '锐字真言体'},
    {font: 'YousheBiaotihei', name: '优设标题黑'},
    {font: 'fandixiaowanzixiaoxueban', name: '新蒂小丸子小学版'},
    {font: 'Zihun116', name: '字魂116号-凤鸣手书'}
]

// express 实例
const app = express();

// 转化参数设置
app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));
app.use(express.static(__dirname+'/'))
app.head("/health/check", function(req,rsp){
  rsp.send({hostname:os.hostname()});
})
// post 接口
app.post('/getfontmin', function(request, response){
    const params = request.body
    const font = params.font
    const text = params.text
    // 如果传递的font字体在后台没有就返回400
    const item = fonts.find(e => e.font === font)
    if(item) {
        fontmin(font, text, function(e,textHex) {
            if(e === 'done') {
               console.log('done')
               // 拼接参数 返回请求
               let back = {
                   url: '/font/' + textHex + "/subset/" + font + '.ttf',
                   font: font,
               }
               response.send(back);
            }
        });
    } else {
        response.status(400);
        response.send('没有请求的字体文件');
    }
});

const schedule = require('node-schedule');
// 凌晨5点执行一次清理工作
schedule.scheduleJob('0 0 5 * * *', () => {
  console.log('start clear storage ',new Date());
  // 删除一天前的文件
  findRemoveSync(path.join(__dirname,'font'), {age: {seconds: 86400}, limit: 100, dir: '*'})
});
app.listen(3000);
