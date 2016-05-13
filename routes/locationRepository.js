var locations = []; // saves the locations in memory
var nextNewId = 0;
var route = require('./index');

exports.createLocation = function(lat, long, name, hash) {
    var location = {
        lat: lat,
        long: long,
        name: name,
        hash: hash,
        id: nextNewId
    };
    route.save(nextNewId, location, function(saveErr, results) {
        console.log("yo");
    });
    locations.push(location);

    nextNewId++;
    return location;
}

exports.getLocations = function() {
    return locations;
}
