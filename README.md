Simple Node Blog
=======

This is my attempt at building a blog using Node.js and MongoDB.

### Installation
This was build using Node.js(v0.10.10) and MongoDB(v2.4.4).

First install the node_modules by running:
```
npm install
```
You'll also have to set a config.js for the email page, I have included an example.

For running the application for the first time:
```
node app -s
```
This will make a default admin account and blog post. Other wise, you can just run...
```
node app
```

### Tests
You have to have jasmine-node running. To install it run...
```
npm install jasmine-node -g
```
Then you can run the tests by turning on the server and run...
```
jasmine-node spec/
```