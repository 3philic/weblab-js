var express = require('express');
var router = express.Router();
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

    if (!searchName) {
        searchName = "";
    }

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
          if (allLocations[i].hash.toLowerCase().indexOf(searchName) > -1) {
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


//REDIS

client.on('connect', function() {
    console.log('Redis client: connected');
});

exports.saveJSON = function (key, value, callback) {
    function saveIfNew(err, exists) {
        if (!err && !exists) {
            client.multi()
            .set(key, JSON.stringify(value))
            .exec(function(err, results) {
                callback(err, results)
            });
        } else {
            callback(err, exists);
        }
    }
    client.exists(key, saveIfNew);
};

exports.getJSON = function (key, callback) {
    client.get(key, function(err, res) {
        if (err)
            callback(err, null);
        else
            callback(null, JSON.parse(res));
    });
};

exports.getSortedListEntries = function (key, rangeStart, rangeEnd, callback) {
    client.zrange(key, rangeStart, rangeEnd, function(err, res) {
        if (err)
            callback(err, null);
        else
            callback(null, res);
    });
};

exports.setSortedListEntry = function (key, score, value, callback) {
  client.multi()
  .zadd(key, score, value)
  .exec(function(err, results) {
      callback(err, results)
  });
}

module.exports = router;
