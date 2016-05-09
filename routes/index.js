var express = require('express');
var router = express.Router();
var locs;

var locationRepository = require('./locationRepository');

// Middlewares
function showTagging(req, res, next) {
  var options = {
       title : 'Geo Location Tagging'
  };
  res.render('tagging', options);
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
router.get('/discovery', function(req, res, next) {
  locationRepository.createLocation(49.013790, 8.404435, 'castle', '#sight');
  locationRepository.createLocation(49.013790, 8.390071, 'iwi', '#edu');

  var options = {
        title : 'Geo Location Discovery',
        locations : locationRepository.getLocations() };
  locs = options[2];
    res.render('discovery', options);
});

module.exports = router;
