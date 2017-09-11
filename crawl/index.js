var request = require('request');
var jq = require('jquery');
var { JSDOM } = require('jsdom');
var htmlparser = require('htmlparser');
var html = require('htmlparser-to-html');
var randomstring = require('randomstring');
var fs = require('fs');

(function() {
	var requestQue = [];
	var fetchPage = function(url, callback) {
		requestQue.push({
			url: url,
			callback: callback,
		});
	};
	var randInt = function(x) {
		return Math.floor(Math.random() * x);
	};
	var fetchCount = 0;
	setInterval(function() {
		if (requestQue.length == 0) {
			return;
		}
		const uas = [
			'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)',
			'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:33.0) Gecko/20120101 Firefox/33.0',
			'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
		];
		var req = requestQue[0];
		requestQue.shift();
		request({
			url: req.url,
			headers: {
				'User-Agent': uas[randInt(4)]
			}
		}, function(error, res, body) {
			var handler = new htmlparser.DefaultHandler(function(error, dom) {
				if (error) {
					console.error(error);
				} else {
					console.log(req.url + ' fetched count = ' + (++ fetchCount));
					req.callback(dom);
				}
			});
			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);
		});
	}, 500);
	var filterTableIndex = function(doc) {
		if (doc.name === 'a') {
			var ref = doc.attribs.href;
			if (typeof(ref) === 'string' && ref.match(/^\/wiki\/List_of/) !== null) {
				fetchPage('https://en.wikipedia.org' + ref, function(dom) {
					linkDFS(dom, filterPeopleIndex);
				});
				return true;
			}
		}
		return null;
	};
	var filterPeopleIndex = function(doc) {
		if (doc.name === 'a') {
			var ref = doc.attribs.href;
			if (typeof(ref) === 'string' && ref.match(/^\/wiki\/([A-Z][a-z]*_)*[A-Z][a-z]*/) !== null) {
				fetchPage('https://en.wikipedia.org' + ref, function(dom) {
					linkDFS(dom, filterInfo);
				});
				return true;
			}
		}
		return false;
	};
	var personCount = 0;
	var filterInfo = function(doc) {
		if (doc.name === 'table') {
			if (typeof(doc.attribs) !== 'object') {
				return 0;
			}
			var attr = doc.attribs.class;
			if (typeof(attr) === 'string' && attr.match(/infobox vcard/) !== null) {
				console.log('person got ' + (++ personCount));
				var htmlText = html(doc).replace("//upload", "https://upload");
				fs.writeFile('data/' + randomstring.generate({
					length: 16,
					charset: '0123456789abcdef'
				}) + '.html', htmlText);
			}
		}
	};
	var linkDFS = function(dom, filter) {
		for (var ti in dom) {
			var doc = dom[ti];
			filter(doc);
			linkDFS(doc.children, filter);
		}
	};
	/*fetchPage('https://en.wikipedia.org/wiki/Frank_Abbandando', function(doc) {
		linkDFS(doc, filterInfo);
	});*/
	/*fetchPage('https://en.wikipedia.org/wiki/List_of_teetotalers', function(doc) {
		linkDFS(doc, filterPeopleIndex);
	});*/
	fetchPage('https://en.wikipedia.org/wiki/Lists_of_people', function(doc) {
		linkDFS(doc, filterTableIndex);
	});
})();
