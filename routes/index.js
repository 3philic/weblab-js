var express = require('express');
var router = express.Router();
var locs;

var locationRepository = require('./locationRepository');

// Middlewares
function showTagging(req, res) {
  var options = {
       title : 'Geo Location Tagging'
  };
  res.render('tagging', options);
}

function createDemoLocations(req, res, next) {
  locationRepository.createLocation(49.013790, 8.404435, 'castle', '#sight');
  locationRepository.createLocation(49.013790, 8.390071, 'iwi', '#edu');
  next();
}

function getLocations(req, res, next) {
  var searchName = req.query.name;

  if (!searchName) {
    searchName = "";
  }

  var allLocations = locationRepository.getLocations();
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
}

/* GET home page. */
router.get('/', function(req, res, next) {
    var options = {
         title : 'Geo Location App'
    };
    res.render('index', options);
});
/* GET tagging page. */
router.get('/tagging', showTagging);
/* POST tagging page. */
router.post('/tagging', function(req, res, next) {
  console.log(req.body);
  locationRepository.createLocation(req.body['latitude'], req.body['longitude'],
    req.body['name'], req.body['hashtag']);

  next();
}, showTagging);
/* GET discovery page. */
router.get('/discovery', createDemoLocations, getLocations, function(req, res, next) {

  var options = {
        title : 'Geo Location Discovery',
        locations : req.locations };
    locs = options[2];
    res.render('discovery', options);
});

module.exports = router;
