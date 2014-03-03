var request = require('request');

module.exports = function(options, cb) {

	var domain = options.domain;
	var appName = options.app;

	getConfig(domain, appName, function(err, config) {
		if (err) {
			cb(err);
			return;
		};

		var ipOptions = {
			endpoint: config.ipEndpoint,
			user: options.user,
			pass: options.password,
			scope: config.authServiceScope
		}

		getIpToken(ipOptions, function(err, ipToken) {
			if (err) {
				cb(err);
				return;
			};

			getKidozenToken(ipToken, config, function(err, kidoToken) {
				if (err) {
					cb(err);
					return;
				};

				var result = { 
					kidoToken: kidoToken,
					ipToken: ipToken
				}

				cb(null, result);
			});
		})
	});
}


function getConfig(domain, appName, cb) {
	request({ uri: 'https://' + domain + '/publicapi/auth/config?app=' + appName, strictSSL: false }, function(err, res, body) {
		if (err) {
			cb(err);
			return;
		};

		cb(null, JSON.parse(body));
	})
}


function getIpToken(options, cb) {

	var req = {
		uri: options.endpoint,
		method: "POST",
		form: {
			wrap_name: options.user,
			wrap_password: options.pass,
			wrap_scope: options.scope
		}
	}

	request(req, function(err, response) {
		if (err || response.statusCode != 200) {
			cb(err);
			return;
		};

		var token = parseRstr(response.body);

		cb(null, token);
	});
}

function parseRstr(rstr) {
	var tokenParsed = /<Assertion(.*)<\/Assertion>/.exec(rstr);

	if (!tokenParsed || tokenParsed.length == 0) {
		return;
	};

	return tokenParsed[0];
}


function getKidozenToken(ipToken, config, cb) {
	var postRequest = {
		uri : config.authServiceEndpoint,
		method : "POST",
		form : {
			wrap_assertion : ipToken,
			wrap_scope : config.appScope,
			wrap_assertion_format : "SAML"
		},
		strictSSL: false
	};

	request(postRequest, function(err, res, body) {

		if (err || res.statusCode != 200) {
			return cb(err);
		}

		var tokenResponse;

		try {
			tokenResponse = JSON.parse(body);
		}
		catch(e) {
			return cb('Invalid Kidozen token');
		}

		if (!tokenResponse.rawToken) {
			return cb('You don not have access to perform this action.');
		}

		var kidoToken = tokenResponse.rawToken;

		cb(null, kidoToken);
	});
}

