var request = require('request');
var jq = require('jquery');
var htmlparser = require('htmlparser');
var html = require('htmlparser-to-html');
var randomstring = require('randomstring');
var fs = require('fs');
var md5 = require('md5');

(function() {
	try {
		fs.mkdirSync('data');
	} catch(error) {
	}
	var requestQue = [];
	var urlRec = {};
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
		if (urlRec[req.url] !== undefined) {
			return;
		}
		urlRec[req.url] = true;
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
					req.callback(dom, req.url);
				}
			});
			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);
		});
	}, process.env.INTERVAL || 500);
	var filterTableIndex = function(doc, url) {
		if (doc.name === 'a') {
			var ref = doc.attribs.href;
			if (typeof(ref) === 'string' && ref.match(/^\/wiki\/List_of/) !== null) {
				fetchPage('https://en.wikipedia.org' + ref, function(dom) {
					linkDFS(dom, url, filterPeopleIndex);
				});
				return true;
			}
		}
		return null;
	};
	var filterPeopleIndex = function(doc, url) {
		if (doc.name === 'a') {
			var ref = doc.attribs.href;
			if (typeof(ref) === 'string' && ref.match(/^\/wiki\/([A-Z][a-z]*_)*[A-Z][a-z]*/) !== null) {
				if (ref.match(/(List)|(list)|(Category)/) !== null) {
					fetchPage('https://en.wikipedia.org' + ref, function(dom) {
						linkDFS(dom, url, filterPeopleIndex);
					});
				} else {
					fetchPage('https://en.wikipedia.org' + ref, function(dom) {
						linkDFS(dom, url, filterInfo);
					});
				}
				return true;
			}
		}
		return false;
	};
	var personCount = 0;
	var filterInfo = function(doc, url) {
		if (doc.name === 'table') {
			if (typeof(doc.attribs) !== 'object') {
				return 0;
			}
			var attr = doc.attribs.class;
			if (typeof(attr) === 'string' && attr.match(/(infobox)|(vcard)/) !== null) {
				var htmlText = html(doc).replace("//upload", "https://upload");
				if (htmlText.match(/(Born)|(Occupation)|(Died)|(Nationality)|(Education)/) !== null) {
					console.log('person got ' + (++ personCount));
					fs.writeFile('data/' + md5(htmlText) + '.html', htmlText);
				}
			}
		}
	};
	var linkDFS = function(dom, url, filter) {
		for (var ti in dom) {
			var doc = dom[ti];
			filter(doc, url);
			linkDFS(doc.children, url, filter);
		}
	};
	switch (2) {
		case 0:
			fetchPage('https://en.wikipedia.org/wiki/Brian_Kobilka', function(doc, url) {
				linkDFS(doc, url, filterInfo);
			});
			break;
		case 1:
			fetchPage('https://en.wikipedia.org/wiki/List_of_teetotalers', function(doc) {
				linkDFS(doc, filterPeopleIndex);
			});
			break;
		case 2:
			fetchPage('https://en.wikipedia.org/wiki/Lists_of_people', function(doc, url) {
				linkDFS(doc, url, filterTableIndex);
			});
			break;
	};
})();
