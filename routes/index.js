var express = require('express');
var router = express.Router();
var path = require('path');
var redis = require('redis');
var client = redis.createClient();
var locs;
var locationRepository = require('./locationRepository');


// Middlewares
function showTagging(req, res) {
    var options = {
        title: 'Geo Location Tagging'
    };
    res.render('tagging', options);
}

var createDemoLocationsDoOnce = false;

function createDemoLocations(req, res, next) {
    if (!createDemoLocationsDoOnce) {
        locationRepository.createLocation(49.013790, 8.404435, 'castle', '#sight', function (err, result) {
          // locationRepository.createLocation(49.013790, 8.390071, 'iwi', '#edu');
          createDemoLocationsDoOnce = true;

          next();
        });
    } else {
      next();
    }
}

function getLocations(req, res, next) {
    var searchName = req.query.name;
    var searchHashtagName = req.query.hashtagName;

    if (!searchName) {
        searchName = "";
    }
    if (!searchHashtagName) {
      searchHashtagName = searchName;
    }

    // ensure lower case query parameters
    searchName = searchName.toLowerCase();
    searchHashtagName = searchHashtagName.toLowerCase();

    locationRepository.getLocations(function (err, result) {
      var allLocations = result;
      var relevantLocations = [];

      // aquire locations with matching names to search term
      for (var i = 0; i < allLocations.length; i++) {
          if (allLocations[i].name.toLowerCase().indexOf(searchName) > -1) {
              relevantLocations.push(allLocations[i]);
          }
      }
      // aquire locations with matching hashtags to search term
      for (var i = 0; i < allLocations.length; i++) {
          if (allLocations[i].hash.toLowerCase().indexOf(searchHashtagName) > -1) {
              // check if the location has already been added to the relevantLocations
              var relevantLocationsContainsLocation = false;
              for (var j = 0; j < relevantLocations.length; j++) {
                  if (allLocations[i].id == relevantLocations[j].id) {
                      relevantLocationsContainsLocation = true;
                  }
              }
              if (!relevantLocationsContainsLocation) {
                  relevantLocations.push(allLocations[i]);
              }
          }
      }

      req.locations = relevantLocations;
      next();
    });

}

function validateRestLocationInput(req, res, next) {
    var failed = false;
    if (!req.body['lat']) {
      failed = true;
    }
    if (!req.body['long']) {
      failed = true;
    }
    if (!req.body['name']) {
      failed = true;
    }
    if (!req.body['hash']) {
      failed = true;
    }

    if (!failed) {
      next();
    } else {
      res.send('Malformed input JSON');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var options = {
        title: 'Geo Location App'
    };
    res.render('index', options);
});
/* GET tagging page. */
router.get('/tagging', showTagging);
/* POST tagging page. */
router.post('/tagging', function(req, res, next) {
    console.log(req.body);
    locationRepository.createLocation(req.body['latitude'], req.body['longitude'],
        req.body['name'], req.body['hashtag'], function (err, result) {
          next();
        });
}, showTagging);
/* GET discovery page. */
router.get('/discovery', createDemoLocations, getLocations, function(req, res, next) {

    var options = {
        title: 'Geo Location Discovery',
        locations: req.locations
    };
    locs = options[2];
    res.render('discovery', options);
});
/* GET apidoc page. */
router.get('/apidoc', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/../doc/Raml/api.html'));
});

//REST
/* /locations */
/* GET locations */
router.get('/api/locations',function(req, res, next) {
  next();
}, getLocations, function (req, res, next) {
    var locas = req.locations;
    console.log(locas);
    res.statusCode = 200;
    res.send(locas);
}

);
/* POST locations */
router.post('/api/locations', validateRestLocationInput, function(req, res) {
  console.log(req.body);
  locationRepository.createLocation(req.body['lat'], req.body['long'],
      req.body['name'], req.body['hash'], function (err, result) {
        if (!err) {
          res.statusCode = 201;
          res.send(result);
        } else {
          res.send('Not created.');
        }
      });
});

/* /locations/location-id */
/* DELETE /locations/location-id */
router.delete('/api/locations/:id', function(req, res) {
  var id = req.params.id;
  locationRepository.deleteLocation(id, function (err, result) {
        if (!err && result == 1) {
          res.sendStatus(204);
        } else {
          res.statusCode = 404;
          res.send('Location at beID was not found.');
        }
      });
});
/* GET /locations/location-id */
router.get('/api/locations/:id',function(req, res, next){
  var key = req.params.id;
  locationRepository.getLocation(key, function (err, result){
    if (result != null) {
      res.statusCode = 200;
      res.send(result)
    }else{
      res.sendStatus(404);
    }

  });
});
/* PUT /locations/location-id */
router.put('/api/locations/:id', validateRestLocationInput, function(req, res) {
  var id = req.params.id;
  locationRepository.replaceLocation(req.body['lat'], req.body['long'],
      req.body['name'], req.body['hash'], id, function (err, result) {
        if (!err && result) {
          res.statusCode = 200;
          res.send(result);
        } else {
          res.statusCode = 404;
          res.send('Location at beID was not found.');
        }
      });
});

//REDIS

client.on('connect', function() {
    console.log('Redis client: connected');
});

exports.remove = function (key, callback) {
  client.multi()
  .del(key)
  .exec(function(err, results) {
      callback(err, results)
  });
};

exports.saveJSON = function (key, value, callback) {
  client.multi()
  .set(key, JSON.stringify(value))
  .exec(function(err, results) {
      callback(err, results)
  });
};

exports.getJSON = function (key, callback) {
    client.get(key, function(err, res) {
        if (err)
            callback(err, null);
        else
            callback(null, JSON.parse(res));
    });
};

exports.getString = function (key, callback) {
    client.get(key, function(err, res) {
        if (err)
            callback(err, null);
        else
            callback(null, res);
    });
};

exports.setString = function (key, value, callback) {
  client.multi()
  .set(key, value)
  .exec(function(err, results) {
      callback(err, results)
  });
}

module.exports = router;
