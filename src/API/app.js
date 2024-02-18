var express = require("express");
var app = express();
var upload = require('./upload.js');



app.use(express.static("public"));
app.use('/', upload);





app.listen(8000, function () {
    console.log('啟動')
})
