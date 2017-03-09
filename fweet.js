var mongoose    = require('mongoose');
var restify     = require('restify');

// -----------------------------------------------------------------------------

db = mongoose.connect('mongodb://localhost/test');

var fweetSchema = new mongoose.Schema({
    date:       Date,
    thing:      String,
    payload:    Object,
});

mongoose.model('Fweet', fweetSchema);
var Fweet = mongoose.model('Fweet');

// -----------------------------------------------------------------------------

function getLastFweet(req, res, next)
{
    // Resitify currently has a bug which doesn't allow you to set default headers
    // This headers comply with CORS and allow us to server our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Fweet.find({ thing: req.params.thing })
         .sort('-date')
         .limit(1)
         .exec(function(err, results) {
            if (err) {
                console.error(err);
                res.status(500);
                res.send(err);
            }
            var fweet = results[0];
            res.send(fweet.payload);
    });
    return next();
}

function postFweet(req, res, next)
{
    // Resitify currently has a bug which doesn't allow you to set default headers
    // This headers comply with CORS and allow us to server our response to any origin
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var fweet       = new Fweet();
    fweet.date      = new Date();
    fweet.thing     = req.params.thing;
    fweet.payload   = req.body;
    fweet.save(function () {
        res.send(req.body);
    });
    return next();
}

// -----------------------------------------------------------------------------

server = restify.createServer();
server.use(restify.bodyParser());

server.post('/:thing', postFweet);
server.get('/:thing',  getLastFweet);
server.listen(8080);
