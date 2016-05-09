var locations = []; // saves the locations in memory

exports.createLocation = function(lat, long, name, hash) {
  var location = {  lat : lat,
            long : long,
            name : name,
            hash : hash};
  locations.push(location);
  return location;
}

exports.getLocations = function() {
  return locations;
}
