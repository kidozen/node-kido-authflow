Kidozen Base Authentication Flow
==================

Node.js module implementing base Kidozen token dance flow.

## Installation

```bash
$ npm install kido-authflow
```

## Usage

```javascript

var kidoAuthFlow = require('kido-authflow');

var options = {
	domain: 'yourcomapny.kidocloud.com',
	user: 'youruser@kidozen.com',
	password: 'your-password',
	app: 'your-app-name'
}

kidoAuthFlow(options, function(err, result) {
	// err

	var kidozenToken = result.kidoToken;
	var ipToken = result.ipToken;
});

```
