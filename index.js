#!/usr/bin/env node

const hgt     = require('node-hgt');
const express = require('express');
const config  = require(__dirname + '/config.js');

var tileset = new hgt.TileSet(config.tiles.folder);
var app = express();

app.route('/ele')
  .get(getElevation);
  
app.use(handle404);

function getElevation(req, res, next) {
    var latlng = req.query.d.split(',');
    latlng[0] = parseFloat(latlng[0]);
    latlng[1] = parseFloat(latlng[1]);
	tileset.getElevation(latlng, function(err, elevation) {
		if (err) {
			console.log('getElevation failed: ' + err.message);
			return res.json({'error': 'bad request'});
		} else {
			return res.json({'ele': parseInt(elevation)});
		}
	});
}

function handle404(req, res, next) {
  res.status(404).end('not found');
}

app.listen(config.express.port);
console.log('App is listening on port ' + config.express.port);


/*
function getTileURL(lat, lon, zoom) {
	var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
	var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
	return "https://s3.amazonaws.com/elevation-tiles-prod/normal/" + zoom + "/" + xtile + "/" + ytile + ".png";
	
	https://s3.amazonaws.com/elevation-tiles-prod/skadi/N04/N04E001.hgt.gz
	
	return "https://s3.amazonaws.com/elevation-tiles-prod/skadi/{N|S}" + ytile + "/{N|S}" + ytile + "{E|W}" + xtile + ".hgt.gz"
}

*/