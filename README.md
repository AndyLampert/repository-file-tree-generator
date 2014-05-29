Github Repository File Tree Generator
==============================
This web app aims to help find files and folders nested deep in Github repositories. Navigate to the repo you want to graph, copy the link, and submit the form to see a visual representation of the repo file structure. 

### Built with
* [NodeJS](http://nodejs.org/)
* [Express](http://expressjs.com/)
* [Require](http://requirejs.org/)
* [D3](http://d3js.org/)

### Resources
* [Github API - Get a Tree](https://developer.github.com/v3/git/trees/)
* [D3 Layout Example](http://mbostock.github.io/d3/talk/20111018/tree.html)

### API Notes
`$ curl -u "username" https://api.github.com` will get information on that user
`/repos/:owner/:repo/git/trees/:sha?recursive=1` for recursive list of that repo

Replace `:owner` with the github username, `:repo` with the repo name, and `:sha` with either the latest commit ID or with HEAD like so:
`https://api.github.com/repos/AndyLampert/repository-file-tree-generator/git/trees/HEAD?recursive=1`