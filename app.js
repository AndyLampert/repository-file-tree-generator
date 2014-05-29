var express = require('express');
var bodyParser = require('body-parser');
// request boilerplate code
var request = require('request');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

var getGitURL = function(){
	//
}

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
	    	// info is the big object with the tree array that I get back from GH
	    	// parse takes json string and converts it into an info object
	        var info = JSON.parse(body);
	        var rootObj = {  
	        	name: "test",
	        	children: []
	         };

	        function ifNodeExists(arr, checkName) {
	        	// loop through arr to see if it has a name in it that matches the param name. If it matches, use that one, if it doesn't, create a new one.
	        	// arr => pass the children array
	        	// name => what I'm looking for
	        	// should return true is the name prop is already in given arr
	        	for (var i = 0; i < arr.length; i++) {
	        		// console.log("if node exists: ", i, arr[i]);
	        		if(arr[i].name === checkName) {
	        			// if it's (checkName) found, meaning the node already exists, so return true
	        			return true;
	        		}
	        	};
	        	// if no nodes are found (matching nodes), then node does not exist, so return false
	        	return false;
	        }

	        for(var i = 0; i < info.tree.length; i++){
	        	// console.log(info.tree[i].path);
	        	// create keys on rootObj dynamically
	        	var marker = rootObj;
	        	var rawPath = info.tree[i].path.split('/');
	        	for (var j = 0; j < rawPath.length; j++) {
	        		// console.log(rawPath[j]);

	        		var nodeExists = ifNodeExists(marker.children, rawPath[j]);

	        		console.log(marker.name);
	        		// console.log("rawPath[j] -->", rawPath[j], "nodeExists--_>", nodeExists);
	        		// if the node does not exist, then create the new node and push it to children
	        		if(!nodeExists){
		        		var node = {
		        			name: rawPath[j],
				        	children: []
				        }
				        // if(rootObj.name.length < 1) {
				        // don't make another one?
				        marker.children.push(node);
				        // update the marker
				        marker = node;
	        		}
	        	};
	        };
	        console.log(rootObj);

	        res.send(rootObj);
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
