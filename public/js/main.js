// This doesn't change the str, so will need to assign to new var
$(document).on('ready',function(){
  // var url = $('#input-url').val();
  // console.log(url.length);
  $('#main-form').on('submit',function(){
    // parsing the input url (removing the http stuff)
    var userInputURL = $('#input-url').val();
    var updatedUserInputUrl = removeHTTP(userInputURL);
    // turning string into an array split on /
    URLtoArr = updatedUserInputUrl.split('/');
    // console.log(URLtoArr);
    // ajax request, sending username and reponame
    $.get('/repo-tree', {
      userName: URLtoArr[1],
      repoName: URLtoArr[2] 
    }, function(repoTree){
      // console.log('response has come back!', repoTree);
      // console.log("repoTree through the transform()", transform(repoTree) );
      // After submit, after ajax response, run the update function (after running transform function on repoTree, the response data from gh)
      var d3object = transform(repoTree);
      // our github data comes back and we pass our d3object for source and oldsource
      update(d3object, d3object);
    })
    return false;
  });
});

// defining function to remove the http junk from the api response data url
var removeHTTP = function(str){
  // This is a RegEX that will remove http or https from str.
  return str.replace(/http[s]?:\/\//,'');
}

// not a url, just changing data from github to usable json
// repoTree => the json response from github 
// completely generic function that will transform github data to d3 data
var transform = function(repoTree){ 



  var urlarray = removeHTTP(repoTree.url).split('/');
  // urlarr[3] => repo name
  var repoName = urlarray[3];

  // creates empty final object (that will eventually be in the d3 format)
  var d3formattedObj = {};
  // creates name prop and assigns its value to something
  d3formattedObj.name = repoName;
  // creates children prop and assign its value an empty array
  d3formattedObj.children = []; // push into this

  // in trans function, loop over the tree, 
  // for each path create obj literal with a single key/value pair (name: currentItem.path)
  // current item I’m looping over
  // Then push that onto an array of children (into d3formattedObj)
    for (var i = 0; i < repoTree.tree.length; i++) {
      // var newObj = repoTree[i].path
      var pathName = repoTree.tree[i].path;
      var childArr = [];
      var childArrEntry = {};
      childArrEntry.name = pathName;
      d3formattedObj.children.push(childArrEntry);
      console.log('pathName is :', pathName);
      console.log('d3formattedObj is :', d3formattedObj);
      console.log('childArrEntry is: ', childArrEntry);
      console.log('childArr is: ', childArr);
    };

  // returns object ready for d3 rendering
  d3formattedObj.x0 = h / 2;
  d3formattedObj.y0 = 0;
  return d3formattedObj;
}

// D3 CODE
var m = [20, 120, 20, 120],
    w = 1280 - m[1] - m[3],
    // height
    h = 1000 - m[0] - m[2],
    i = 0,
    root;

var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#d3-container").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.json("/json/flare.json", function(json) {
  // root => flare.json converted into JS object  
  root = json;
  // adds new propery!
  root.x0 = h / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }
  // 
  update(root, root);
});

// adding oldScouce because it is relying on root which is global
// oldSource is root moved to an argument
function update(source, oldSource) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(oldSource).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      // set up click handler to call the same function
      .on("click", function(d) 
        { 
          // on click, toggle all the children (vis/hide) AND re-render entire tree
          toggle(d); 
          update(d, oldSource); 
        });

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  // handles update method
  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// hide or shows all children of a node
// d_children -> hidden nodes
// d.children -> visible nodes
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}