var route = require('./index');

function incrementBeID (callback) {
  nextLocationBeID(function(err, res) {
    route.setSortedListEntry("beID", "1", res+1, function(err, result) {
      callback(null, res+1);
    });
  });
}

nextLocationBeID = function(callback) {
  route.getSortedListEntries("beID", "-1", "-1", function(err, result) {
    if (result.length > 0) {
      callback(null, parseInt(result[0], 10));
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
