var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var fs = require('fs')
var parseString = require('xml2js').parseString;
var request = require('request');

app.listen(7777, '127.0.0.1');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500); // error!
      return res.end('Error loading index.html');
    }
    res.writeHead(200); // boom baby!
    res.end(data);
  });
}

var feeds = {
	'hackernews':	'https://news.ycombinator.com/rss',
	'redditscience':	'http://www.reddit.com/r/science/.rss',
	'redditios':	'http://www.reddit.com/r/iOSProgramming/.rss',
	'redditandroid': 'http://www.reddit.com/r/Android/.rss',
	'redditbitcoin': 'http://www.reddit.com/r/Bitcoin/.rss',
	'redditdailyprogrammer': 'http://www.reddit.com/r/dailyprogrammer/.rss',
	'redditdataisbeautiful': 'http://www.reddit.com/r/dataisbeautiful/.rss',
	'redditgolang': 'http://www.reddit.com/r/golang/.rss',
	'redditjavascript': 'http://www.reddit.com/r/javascript/.rss',
	'redditpython': 'http://www.reddit.com/r/Python/.rss'

};

var data = {};

var read = function () {
	for(index in feeds) {
		var value = feeds[index];
		data[index] = [];
		(function (ref){
			request(value, function (error, response, body) {
				if (!error && response.statusCode == 200) {
				    parseString(body, function (err, result) {
				    	var items = result.rss.channel[0].item;
				    	io.sockets.emit('new-post', {src: ref, data: items});
				    });
				}
			});
		})(index);
	}
	setTimeout(function(){read();}, 5000);
};
read();

