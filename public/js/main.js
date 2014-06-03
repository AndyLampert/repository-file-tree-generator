// Declaring some variables globally so I can use them in multiple scopes
var URLtoArr;

$(document).on('ready',function(){

  // on form submit... 
  $('#main-form').on('submit', function(){
    console.log('asdf');
  })

  // modal error checks and appends
  // on clicking the "input a git-what?" link
  $(document).on('click', '.explain-app-link', function(){

  });

  // on clicking one of the example repo links in the modal window
  $(document).on('click', '.example-repo-link', function(e){
    var currentRepoLink = $(this).attr("href");
    e.preventDefault();
    console.log('currentRepoLink -->', currentRepoLink);
    $('#input-url').val(currentRepoLink);
    $('.explanation-modal').modal('hide');
    $('.form-submit').submit();
  });

  // on submit of the repo url input field... 
  $('#main-form').on('submit',function(){
    // parsing the input url (removing the http stuff)
    userInputURL = $('#input-url').val();
    console.log('userInputURL in submit handler-->', userInputURL);
    // run the removeHTTP function (removing http junk) on the user input 
    updatedUserInputUrl = removeHTTP(userInputURL);
    // turning user input into an array split on /
    URLtoArr = updatedUserInputUrl.split('/');

    // ajax request, sending username and reponame
    $.ajax({
      url: '/repo-tree', 
      data: {
        // second value => github user name
        userName: URLtoArr[1],
        // third value => github repo name 
        repoName: URLtoArr[2] 
      },
      type: 'GET',
      success: function(repoTree){
        // makes the data from the server global under repoTree variable
        window.repoTree = repoTree;

        // creating new size of chart
        // tree.setSize(parseInt(repoTree.height, repoTree.width)
        vis.attr("viewBox", "0 0 800 600" )
        vis.attr("viewBox", "0 0 " + repoTree.width + " " + repoTree.height)
        .attr("width", repoTree.width)
        .attr("height", repoTree.height)
        .attr("preserveAspectRatio", "xMidYMid meet");
        vis.attr("width", repoTree.width);
        console.log('repoTree.width -->', repoTree.width);
        console.log('repoTree.height -->', repoTree.height);
        // var d3object = transform(repoTree);
        var d3object = repoTree.rootObj;

        // our github data comes back and we pass our d3object for source and oldsource
        tree.size([repoTree.height, repoTree.width]);
        update(d3object, d3object);
      },
      error: function(response){
        // alert('error on the client side');
        // gives all arguments passed to a function
        console.log(arguments);
        $('.explain-app-link').click();
        // $('#error-container').append(response.responseText);
      }
    });
    
    /*
    $.get('/repo-tree', {
      // second value => github user name
      userName: URLtoArr[1],
      // third value => github repo name 
      repoName: URLtoArr[2] 
    }, function(repoTree){
      console.log();
      // console.log('response has come back!', repoTree);
      // console.log("repoTree through the transform()", transform(repoTree) );
      // After submit, after ajax response, run the update function (after running transform function on repoTree, the response data from gh)
      var d3object = transform(repoTree);
      // our github data comes back and we pass our d3object for source and oldsource
      update(d3object, d3object);
      console.log('asdf')
    })
    */

    // stops the page from reloading
    return false;
  });
  // Andrew's custom canvas calculation 

  
});

// defining function to remove the http junk from the api response data url
var removeHTTP = function(str){
  // This is a RegEX that will remove http or https from str.
  return str.replace(/http[s]?:\/\//,'');
}

// not a url, just changing data from github to usable json
// repoTree => the json response from github 
// completely generic function that will transform github data to d3 data

/*
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

  // Loop over the tree (head object of response data)
    for (var i = 0; i < repoTree.tree.length; i++) {
      // assign the current tree's path value to pathName
      var pathName = repoTree.tree[i].path;
      var childArr = [];
      var childArrEntry = {};
      // creating new {"name": pathName} object
      childArrEntry.name = pathName;
      // pushing the newly created object into the d3 object
      d3formattedObj.children.push(childArrEntry);
      console.log('pathName is :', pathName);
      console.log('d3formattedObj is :', d3formattedObj);
      console.log('childArrEntry is: ', childArrEntry);
      console.log('childArr is: ', childArr);

      // condition that checks the type
      // if blob - keep current functionality (create no new child nodes)
      // if tree - it needs a "children": []
      // 
      // go from top to bottom, first time I see a tree, create that node (of the path name)
      // when we see another 

      // repoTree - the full obj from the server that it got from GH

    };

  // returns object ready for d3 rendering
  d3formattedObj.x0 = h / 2;
  d3formattedObj.y0 = 0;
  return d3formattedObj;
}
*/

// D3 CODE
var m = [20, 120, 20, 120],
    // width
    w = 1280 - m[1] - m[3],
    // height
    h = 2000 - m[0] - m[2],
    i = 0,
    root;

var tree = d3.layout.tree()
    // .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#d3-container").append("svg:svg")
    // .attr("width", w + m[1] + m[3])
    // .attr("height", h + m[0] + m[2]);
vis.append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

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
      .attr("transform", function(d) { 
        // console.log("source", source);
        return "translate(" + (source.y0 || 0) + "," + (source.x0 || 0) + ")"; })
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
  // nodeEnter.append("svg:text")
  //     .attr('font-family', 'FontAwesome')
  //     .attr('font-size', function(d) { return d.size+'em'} )
  //     .attr('font-size', function(d) { return d.size+'1em'} )
  //     .text(function(d) { return '\uf118' })
      // .text("b");
      // .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  // handles update method
  nodeEnter.append("svg:a")
      // make the links open in a new page
      .attr("target", "_blank")
      // change d.name to something that makes a url to the respective github page

      .attr("xlink:href", function(d) { 
        console.log('d.name -->', d.name);
        // d.data.path "" + d.name
        var url = "https://" + URLtoArr[0] + "/" + URLtoArr[1] + "/" + URLtoArr[2] + "/" + "tree/master" + "/";
        // if path is set (if it is NOT the root node), add it on to the end
        if(d.data !== undefined) {
          url += d.data.path; 
        }
        return url; 
        // https://github.com/AndyLampert/repository-file-tree-generator/blob/master/public/css/main.css
      })

      .append("svg:text")
      .text(function(d) { return d.name; })
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", "0.25em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      // .style("fill-opacity", 1e-6);

  // code that works! (backup)
  // nodeEnter.append("svg:text")
  //     .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
  //     .attr("dy", ".35em")
  //     .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  //     .html(function(d) { 
  //       return "<a href='www.google.com'>" + d.name + "</a>"; 
  //     })
      // .style("fill-opacity", 1e-6);


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
        var o = {x: (source.x0 || 0), y: (source.y0 || 0)};
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