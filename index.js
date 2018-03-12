#!/usr/bin/env node

const hgt     = require('node-hgt');
const express = require('express');
const config  = require(__dirname + '/config.js');
const mkdirp  = require('mkdirp');
const fs      = require('fs');
const mapzen  = require('./mapzen');
const path    = require('path');

if (!fs.existsSync(config.tiles.folder)) {
	mkdirp(config.tiles.folder, function (err) {
		if (err) console.error(err);
	});
}

var tileset = new hgt.TileSet(config.tiles.folder, {'downloader':new mapzen(config.tiles.folder)});
var app = express();



app.use('/', express.static(path.join(__dirname + '/public')));

app.route('/height')
  .get(getElevation);


app.use(handle404);

/*

http://localhost:3001/height?json={"shape":[{"lat":40.712431,"lng":-76.504916},{"lat":40.712275,"lng":-76.605259}]}

http://localhost:3001/height?json={"encoded":"morjnAme`eB?`A\\`@f@`A\\`@d@bB\\bBbAbBbB^bB`@~B?hC?`C`@bA`A?dCcAbBaC?gDeCaBiGcBiFcBeDgCcBgD?aCbBcAbB?`A`B`AhC`@bB?bA`@\\^]bAkB^aB_@aCcAkGaAaB`@e@^]bA\\?d@^?`@\\`@?^d@??_@\\cA^_@d@?\\^bA?|@?bA?d@?^??`@\\`@?^?`@?`@\""}

*/

function checkReferer(refurl, apikey) {
	var refurl_allowed = [];
	var apikey_allowed = [];
	
	if (apikey === undefined || refurl === undefined) return false;
	
	refurl_allowed.push ('node.loctome.com');
	apikey_allowed.push ('elevation_api_key');
	
	for (i=0;i<refurl_allowed.length;i++){
		if(refurl.indexOf(refurl_allowed[0]) > -1) {
			for (i=0;i<apikey_allowed.length;i++){
				if(apikey.indexOf(apikey_allowed[0]) > -1) {
					return true;
				}
			}
		}
	}
	return false;
}

function getElevation(req, res, next) {

    var alatlng = [];
    var type;
    var json    = req.query.json;
    var id      = req.query.id;
    var refurl  = req.headers.referer;
    var apikey  = req.query.api_key;

    if (!checkReferer(refurl, apikey)) {
    	res.status(400).send("Bad referer and api_key");
    	return;
    }

	if (json === undefined){
		res.status(400).send("json parameter not found");
	} else {
		try {
			json = JSON.parse (json);
		} catch (e) {
			res.status(400).send("Bad json");
		}
	}

	try {
		if (json.shape){
			type = "shape";
			for (i=0;i<json.shape.length;i++) {
				alatlng.push (parseFloat(json.shape[i].lat), parseFloat(json.shape[i].lng));
			}
		}
	
		if (json.encoded){
			type = "encoded";
			alatlng = decompress(json.encoded,6);
		}
    } catch (e) {
    	console.log (e);
    	res.status(400).send("Bad Request");
    }
    
	var apromises = [];
	
	for(var i=0; i< alatlng.length; i+=2) {
		var p = new Promise((resolve, reject) => {
			var ll = [];
			ll.push (parseFloat(alatlng[i]));
			ll.push (parseFloat(alatlng[i+1]));
			ll.push (i);

			tileset.getElevation(ll, function(err, elevation) {
				if (err) {
					reject('getElevation failed: ' + err.message);
				} else {
					resolve(
						{
						'lat': ll[0],
						'lng': ll[1],
						'ele': parseInt(elevation),
						'ord': ll[2]
						}
					);
				}
			});
		});
		  
		apromises.push(p);
	}

	Promise.all(apromises).then(values => { 
	    //reorder and remove the ord property
		values.sort(function(a,b) {return (a.ord > b.ord) ? 1 : ((b.ord > a.ord) ? -1 : 0);}); 
		values.forEach(function(v){ delete v.ord });
		var out = {[type]:values};
		if (id !== undefined) out.id = id;
	  	return res.json(out);
	}, reason => {
	  console.log(reason)
	});
	
}


function handle404(req, res, next) {
  res.status(404).end('not found');
}

function decompress(encoded, precision) {
	try {
	    var p = precision;
		precision = Math.pow(10, -precision);
		var len = encoded.length,
			index = 0,
			lat = 0,
			lng = 0,
			array = [];
		while (index < len) {
			var b, shift = 0,
				result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
			lat += dlat;
			shift = 0;
			result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
			lng += dlng;

			array.push((lat * precision).toFixed(p));
			array.push((lng * precision).toFixed(p));
		}
		return array;
	} catch (err) {
		msg(err);
	}
}

function compress(points, precision) {
	try {
		var oldLat = 0,
			oldLng = 0,
			len = points.length,
			index = 0,
			encoded = '';
			
		precision = Math.pow(10, precision);
		while (index < len) {
			//  Round to N decimal places
			var lat = Math.round(points[index++] * precision);
			var lng = Math.round(points[index++] * precision);

			//  Encode the differences between the points
			encoded += encodeNumber(lat - oldLat);
			encoded += encodeNumber(lng - oldLng);

			oldLat = lat;
			oldLng = lng;
		}
		return encoded;
	} catch (err) {
		msg(err);
	}
}


app.listen(config.express.port);
console.log('App is listening on port ' + config.express.port);






