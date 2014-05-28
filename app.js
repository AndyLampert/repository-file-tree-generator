var express = require('express');
var bodyParser = require('body-parser');
// request boilerplate code
var request = require('request');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

// api route handler
app.get('/repo-tree', function(req, res){

	// check whether username / reponame are empty
	// if empty, send back a 500 + "you must enter gh url" in an obj literal
	
	// ! because argument is not a boolean, JS converts it to a boolean, so that any falsey values will be a false boolean
	if(!req.query.userName) {
		console.log('username is undefined or empty!');
		res.send(500, "Something wrong with the url (username?)")
		return;
	}
	if(!req.query.repoName) {
		console.log('repo name is undefined or empty!')
		res.send(500, "Something wrong with the url (repo name?)")
		return;
	}

	var options = {
		// Construct new api url from req.query.userName/repoName
		url: 'https://api.github.com/repos/' +  req.query.userName + '/' + req.query.repoName + '/git/trees/HEAD?recursive=1',
	    // github api requires custom header
	    headers: {
	        'User-Agent': 'request'
	    }
	};

	// console.log('req.query.userName', req.query.userName);
	// console.log('req.query.userName', req.query.repoName);

	// request module to make http request to github
	request(options, callback);
	// function callback that handles response from github and sends data back to the client
	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    	// parse takes json string and converts it into an info object
	        var info = JSON.parse(body);

	        // here I need to convert the response json object (info) from github into a json format that I can use
	        
	        // loop through array that comes back (info.tree) <-- the array
	        for (var i = 0; i < info.tree.length; i++) {
	        	// prints the type (blob or tree) and the path in an array
	        	// public/js/vendor/d3.layout.js => ['public', 'js', 'vendor', 'd3.layout.js']
	        	console.log(info.tree[i].type, info.tree[i].path.split('/'));

	        };

			// console.log(req.query.userName);
	        res.send(info);
	    } else {
	    	console.log(options.url);
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
