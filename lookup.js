#!/usr/bin/env node

var config = require("config.js");
var db = require("mongojs").connect(config.mongoUrl, ["countries"]);

db.countries.find({}, function(err, countries) {
	var lookup = {};
	countries.forEach(function(country) {
		if (country.Code) {
			lookup[+parseInt(country.Code)] = [country.Lat, country.Lon];
		}
	});
	console.log(lookup);
});