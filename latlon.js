#!/usr/bin/env node

var config = require("config.js");
var db = require("mongojs").connect(config.mongoUrl, ["countries"]);
var request = require("request");
var xml2js = require("xml2js");

var parser = new xml2js.Parser();

var parseLatLon = function(code, xml) {
	parser.parseString(xml, function(err, result) {
		if (err || !result.geonames.geoname) {
			console.log("Error parsing " + code);
		} else {
			console.log(code + ": " + result.geonames.geoname[0].lat[0] + ", " + result.geonames.geoname[0].lng[0]);
			db.countries.update({Code: code}, 
				{$set: 
					{
						Lat: result.geonames.geoname[0].lat[0], 
						Lon: result.geonames.geoname[0].lng[0]
					}
				}, function(err, updated) {
				if (err || !updated) {
					console.log("Country not updated: " + code);
				}
			});
		}
	});
};

var getLatLon = function(code, name) {
	var url = "http://ws.geonames.org/search?q=" + name + "&featureCode=PCLI";
	request(url, function(err, res, body) {
		parseLatLon(code, res.body);
	});
}

db.countries.find({}, function(err, countries) {
	if (err || !countries) {
		console.log("No countries found");
	} else {
		countries.forEach(function(country) {
			console.log(country.Code + ": " + country.NameEn);
			getLatLon(country.Code, country.NameEn);
		});
	}
});