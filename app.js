const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer')
var db = require('./mysql_conn');
var mysql = db.mysql;
var conn = db.conn;

const app = express()
const port = 3000
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var date = new Date()
        var getMonth = (month) => {
            if(month+1<10) return "0"+(month+1)
            else return month
        }
        var folder = "./uploads/book/"+String(date.getFullYear()).substr(2, 4)+getMonth(date.getMonth())+"/"
        if(!fs.existsSync(folder)) {
            fs.mkdir(folder, (err) => {
                if(!err) cb(null, folder)
            })
        } else cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  
var upload = multer({ storage, fileFilter })
//var upload = multer({ dest: 'uploads/' })

app.locals.pretty = true
app.use('/',express.static('public'))
app.use('/assets',express.static('assets'))
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', './views')

app.get('/book', getQuery);
app.get('/book/:id', getQuery);
app.get('/book/:id/:mode', getQuery);
app.post('/book/create', upload.single('imgfile'), postQuery);

function jsonParse(str) {
    fs.readFile('./data/book.json','utf-8', function(err, data) {
        console.log();
    });
}

function postQuery(req, res) {
    var title = req.body.title
    var content = req.body.content
    var str = "";
    fs.readFile('./data/book.json','utf-8', function(err, data) {
        if(err) res.status(500).send("Internal Server Error")
        datas = JSON.parse(data)
        var id = datas.books[datas.books.length-1].id+1
        datas.books.push({
            title,
            content,
            id
        })
        str = JSON.stringify(datas);
        var sql = " INSERT INTO books SET title=?, content=?, id=? ";
        var params = [title, content, id];
        conn.query(sql, params, (err, rows, field) => {
            if(err) console.log(err);
            else console.log(rows);
        });
        fs.writeFile('./data/book.json', str, (err) => {
            if(err) res.status(500).send("Internal Server Error")
            res.redirect('/book/'+id);
            // res.writeHead(301,{Location: '/book/'+id});
            // res.end();
            // res.send(`<script>location.href="/book/${id}"</script>`);
        })
    });
}

function getQuery(req, res) {
    var params = req.params;
    var pageTitles = ["MAIN","PAGE1","PAGE2","PAGE3"];
    fs.readFile('./data/book.json','utf-8', function(err, data) {
        if(err) res.status(500).send("Internal Server Error")
        var data = JSON.parse(data)
        var pugData = {
            pages: data.books
        }
        if(typeof params.id !== 'undefined') {
            if(params.id == 'new') {
                pugData.tile = "New Item";
                res.render('wr', pugData);
            } else {
                pugData.tile = "Book list";
                res.render('li', pugData);
            }
        }
    })
}

// app.get('/page', (req,res) => {
//     var id = req.query.id;
//     var pageTitles = ["MAIN","PAGE1","PAGE2","PAGE3"];
//     var html = `
//     <ul>
//     <li style="padding:1rem;list-style:none;float:left;width:20%;"><a href="/page?id=0">Main</a></li>
//     <li style="padding:1rem;list-style:none;float:left;width:20%;"><a href="/page?id=1">Page1</a></li>
//     <li style="padding:1rem;list-style:none;float:left;width:20%;"><a href="/page?id=2">Page2</a></li>
//     <li style="padding:1rem;list-style:none;float:left;width:20%;"><a href="/page?id=3">Page3</a></li>
//     <li style="clear:both;"></li>
//     </ul>
//     <div style="text-align:center">
//     <h1>${pageTitles[id]}</h1>
//     </div>`
//     res.send(html);
// });

app.get('/info', (req,res) => {
    var now = new Date();
    var html = `<!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Information</title>
    </head>
    <body>
        <h1>Information Page</h1>
        <h2>${now}</h2>
    </body>
    </html>
    `;
    res.send(html);
})

// multer - file extension check
function fileFilter (req, file, cb) {
    var filename = file.originalname.split('.')
    var ext = filename[filename.length-1]
    var allowExt = "jpg|gif|png|jpeg"
    if(allowExt.includes(ext)) cb(null, true)
    else {
        cb(null, false)
        cb(new Error('I don\'t have a clue!'))
    }
  }

app.listen(port, () => console.log(`http://localhost:${port}`))