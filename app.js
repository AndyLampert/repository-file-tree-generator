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
		res.send(500)
		return;
	}
	if(!req.query.repoName) {
		console.log('repo name is undefined or empty!')
		res.send(500)
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
		// if request to github api is successful (200) AND there are no errors
	    if (!error && response.statusCode == 200) {
	    	// info is the big object with the tree array that I get back from GH
	    	// parse takes json string and converts it into an info object
	        var info = JSON.parse(body);
	        // create a base node 

	        var removeHTTP = function(str){
	          // This is a RegEX that will remove http or https from str.
	          return str.replace(/http[s]?:\/\//,'');
	        }

	        // not a url, just changing data from github to usable json
	        // info => the json response from github 
	        // completely generic function that will transform github data to d3 data
          var urlarray = removeHTTP(info.url).split('/');
          // urlarr[3] => repo name
          var repoName = urlarray[3];

	        var rootObj = {  
	        	name: repoName,
	        	children: []
	         };

	        function getNode(arr, checkName) {
	        	// loop through arr to see if it has a name in it that matches the param name. If it matches, use that one, if it doesn't, create a new one.
	        	// arr => pass the children array
	        	// name => what I'm looking for
	        	// should return true if the name prop is already in given arr
	        	if(arr === undefined){
	        		return null;
	        	}
	        	for (var i = 0; i < arr.length; i++) {
	        		// console.log("if node exists: ", i, arr[i]);
	        		if(arr[i].name === checkName) {
	        			// if it's (checkName) found, meaning the node already exists, return the current object
	        			return arr[i];
	        		}
	        	};
	        	// if no nodes are found (matching nodes), then return no object
	        	return null;
	        }

	        var totalTerminalNodes = 0;
        	var longestWidth = 0;
        	var breathOfTree = [];
	        // loops through all the objects in the response tree
	        for(var i = 0; i < info.tree.length; i++){
	        	// marker is how we track through loops
	        	// create keys on rootObj dynamically
	        	var marker = rootObj;
	        	// takes a file dir (public/css/main.css) and converts it into an array
	        	var rawPath = info.tree[i].path.split('/');
	        	// if the length of the array (number of items in the array) is longer than the longestWidth (preset to 0), override longestWidth with the new longest array. At the end of the loop longestWidth will be the number of items in the longest array.
        		if(rawPath.length > longestWidth) {
        			longestWidth = rawPath.length;
        		}
        		// find all the terminal nodes (nodes that have no children - also commonly called leafnodes), count them up, add that to totalTerminalNodes, to be used to calculate the height of the #d3-container.


	        	// loop through the components of the path (["public", "css", "main.css"])
	        	for (var j = 0; j < rawPath.length; j++) {
	        		// console.log(marker);

	        		// either getting what it was or setting it to zero and adding one each time
	        		breathOfTree[j] = (breathOfTree[j] || 0) + 1

	        		// if(rawPath[j]) {
	        		// 	totalTerminalNodes += rawPath[j]length
	        		// }

	        		var nodeExists = getNode(marker.children, rawPath[j]);

	        		// if the node does not exist, then create the new node and push it to children
	        		if(!nodeExists){ // same as if(nodeExists === null/false)
		        		var node = {
		        			name: rawPath[j],
		        			// adding another prop to send back entire object from github to the client
		        			data: info.tree[i]
				        }

				        // if marker.children is undefined, use the empty array
				        marker.children = marker.children || [];
				        marker.children.push(node);
				        // update the marker
				        marker = node;

	        		} else {
	        			// use the node that came from the getNode() 
	        			marker = nodeExists;
	        		}
	        	};
	        };
	        
	        console.log("longestWidth --->", longestWidth);
	        console.log('breathOfTree -->', breathOfTree);
	        console.log('totalTerminalNodes -->', totalTerminalNodes);
	        // send the whole object back to the client! BAM!

	        var finalWidth = longestWidth * 200;

	        var finalHeight = breathOfTree[0] * 17;
	        
	        rootObj.x0 = finalHeight / 2;
	        rootObj.y0 = 20;

	        res.send({
	        	rootObj: rootObj,
	        	width: finalWidth,
	        	height: finalHeight
	        });
	    } else {
	    	// if it doesn't get to the send, error
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
