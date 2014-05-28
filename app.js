var express = require('express');
var bodyParser = require('body-parser');
// request boilerplate code
var request = require('request');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// api route handler!
app.get('/repo-tree', function(req, res){
	// console.log(req.query.userName);
	var options = {
		// will need to convert the url that the user input into the api format
		// 
		// req.query.userName -> to get the values
		// req.query.repoName
		// 
		// GOAL: construct the url below from req.query.userName/repoName
		// just use str concat (var + var + ... etc)
		url: 'https://api.github.com/repos/' +  req.query.userName + '/' + req.query.repoName + '/git/trees/HEAD?recursive=1',
	    // url: 'https://api.github.com/repos/andylampert/repository-file-tree-generator/git/trees/HEAD?recursive=1',
	    // github api requires custom header
	    headers: {
	        'User-Agent': 'request'
	    }
	};
	console.log('req.query.userName', req.query.userName);
	console.log('req.query.userName', req.query.repoName);

	// request module to make http request to github
	request(options, callback);
	// function callback that handles response from github and sends data back to the client
	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var info = JSON.parse(body);
	        // console.log(info.tree[0].type);
	        // console.log(info);
			console.log(req.query.userName);
	        res.send(info);
	    } else {
	    	console.log("error: ", error);
	    	console.log('status code: ', response.statusCode);
	    	res.send(500)
	    } 
	}
})

app.get('/', function(req, res) {
	// when homepage is requested, run the request
	res.render('index');
});

var server = app.listen(process.env.PORT || 3000, function() {
	console.log('Express server listening on port ' + server.address().port);
});
