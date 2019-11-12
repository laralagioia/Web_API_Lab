// require imports packages required by the application
const express = require('express');
const bodyParser = require('body-parser');

// app is a new instance of express
let app = express();

// Allow app to support differnt body content types (using the bidyParser package)
app.use(bodyParser.text());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/* Configure Routes */

// // The home page 
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/', require('./routes/index'));

app.use('/product', require('./routes/product'));



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found: '+ req.method + ":" + req.originalUrl);
    err.status = 404;
    next(err);
});

// configure the HTTP port
app.set('port', process.env.PORT || 3000);

// Start the HTTP server and listen for incoming connections
var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

// export this as a module, making the app object accessible
module.exports = app;