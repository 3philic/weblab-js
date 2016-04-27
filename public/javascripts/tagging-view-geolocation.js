var test = "";

jQuery(window).ready(function(){
            jQuery("#btnInit").click(initiate_geolocation);
            jQuery("#btnSubmit").click(validateFormAndPost);
        });

function validateFormAndPost() {
    if (isAlphaNumeric(jQuery("#inputName").val())) {
      postForm();
    } else {
      jQuery("#inputName").attr("style", "border: 1px solid red")
    }
}

function postForm() {
  jQuery("#locationForm").submit();
}

function initiate_geolocation() {
    test = jQuery("#btnInit").text();
    jQuery("#btnInit").text("Finding your location…");
    jQuery("#btnInit").attr("disabled", true);

    // actual start of geolacting
    navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors);
}

function handle_errors(error) {
    switch(error.code)
    {
        case error.PERMISSION_DENIED: alert("user did not share geolocation data");
        break;

        case error.POSITION_UNAVAILABLE: alert("could not detect current position");
        break;

        case error.TIMEOUT: alert("retrieving position timed out");
        break;

        default: alert("unknown error");
        break;
    }
}

function handle_geolocation_query(position) {
  /*
    alert('Lat: ' + position.coords.latitude + ' ' +
          'Lon: ' + position.coords.longitude);
  */
    jQuery("#btnInit").text(test);
    jQuery("#btnInit").attr("disabled", false);

    jQuery("#inputLatitude").val(position.coords.latitude);
    jQuery("#inputLongitude").val(position.coords.longitude);
}

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};
