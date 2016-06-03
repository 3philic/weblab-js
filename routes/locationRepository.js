var route = require('./index');

function incrementBeID (callback) {
  nextLocationBeID(function(err, res) {
    route.setString("beID", res+1, function(err, result) {
      callback(null, res+1);
    });
  });
}

nextLocationBeID = function(callback) {
  route.getString("beID", function(err, result) {
    if (result) {
      callback(null, parseInt(result, 10));
    } else {
      callback(null, 0);
    }
  });
}

exports.createLocation = function(lat, long, name, hash, callback) {
  nextLocationBeID(function(err, res) {
    var location = {
        lat: lat,
        long: long,
        name: name,
        hash: hash,
        id: res
    };
    route.saveJSON("location_".concat(res), location, function(saveErr, results) {
      if (!saveErr) {
        console.log("locationRepository: saved location_".concat(res));
        incrementBeID(function (error, result) {
          callback(null, location);
        });
      } else {
        callback(saveErr, null);
      }
    });
  });
}

exports.replaceLocation = function(lat, long, name, hash, id, callback) {
  // check if the location exists
  this.getLocation(id, function(err, res) {
    if (!err && res) {
      var location = {
          lat: lat,
          long: long,
          name: name,
          hash: hash,
          id: id
      };
      console.log("replace with location ".concat(JSON.stringify(location)));
      route.saveJSON("location_".concat(id), location, function(saveErr, results) {
        if (!saveErr) {
          console.log("locationRepository: replaced location_".concat(id));
          console.log("was location ".concat(JSON.stringify(res)));



          callback(null, location);
        } else {
          callback(saveErr, null);
        }
      });
    } else {
      callback(err, null);
    }
  });
}

exports.getLocations = function(callback) {
  nextLocationBeID(function(err, nextLocationBeID) {
    var locations = [];
    if (nextLocationBeID == 0) {
      callback (null, locations);
    } else {
      for (i = 0; i < nextLocationBeID; i++) {
        route.getJSON("location_".concat(i), function(err, result) {
          if (!err) {
            locations.push(result);
          }

          var test = nextLocationBeID-1;
          if (result["id"] == test) {
            callback(null, locations);
          }
        });
      }
    }
  });
}

exports.getLocation = function(id, callback) {
  route.getJSON("location_".concat(id), function(err, result) {
    if (!err) {
      callback(null, result);
    } else {
      callback(err, null);
    }
  });
}
