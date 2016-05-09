var locations = []; // saves the locations in memory
var nextNewId = 0;

exports.createLocation = function(lat, long, name, hash) {
  var location = {
            lat : lat,
            long : long,
            name : name,
            hash : hash,
            id : nextNewId};
  locations.push(location);

  nextNewId++;
  return location;
}

exports.getLocations = function() {
  return locations;
}
