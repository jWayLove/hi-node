const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer')
const app = express()
const port = 3000

var upload = multer({ dest: 'uploads/' })

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

//RESTful Routing
//app.get('/', (req, res) => res.send('Hello World!'))
// app.post('/', (req, res) => res.send('Hello World!'))
// app.put('/', (req, res) => res.send('Hello World!'))
// app.delete('/', (req, res) => res.send('Hello World!'))


// app.get('/', (req, res) => res.redirect());

app.listen(port, () => console.log(`http://localhost:${port}`))