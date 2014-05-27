var express = require('express');
var bodyParser = require('body-parser');
// request boilerplate code
var request = require('request');

// calls the github API to find out the number of stars and forks for the request repository. This requires a custom User-Agent header as well as https.
var options = {
    url: 'https://api.github.com/repos/andylampert/repository-file-tree-generator/git/trees/HEAD?recursive=1',
    headers: {
        'User-Agent': 'request'
    }
};

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// api route handler
app.get('/repo-tree', function(req, res){
	// request module to make http request to github
	request(options, callback);
	// function callback that handles response from github and sends data back to the client
	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var info = JSON.parse(body);
	        console.log(info.tree[0].type);
	        console.log(info);
	        res.send(info);
	    }
	}
})

app.get('/', function(req, res) {
	// when homepage is requested, run the request
	res.render('index');
});

var server = app.listen(3000, function() {
	console.log('Express server listening on port ' + server.address().port);
});
