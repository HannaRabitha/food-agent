var express = require('express');
var axios = require('axios');
var router = express.Router();


router.post('/', function(req, res, next) {
  let name_product = req.body.queryResult.parameters["product"];
  // let url = `http://api.openweathermap.org/data/2.5/weather?q=${city},us&APPID=0ed0839d26e395af50e382032d65017c`;

  // axios.get(url).then(aRes => {
  //   let conditions = aRes.data.weather[0].main;
  //   let temp = aRes.data.main.temp;

  //   let textResponse = `In ${city}, it is ${temp} degrees Kelvin and ${conditions}`;
  //   res.send(createTextResponse(textResponse));

  // }).catch(err => {
  //   console.log(err);
  // })

  let textResponse = `Mencari makanan berdasarkan ${name_product}`;
  res.send(createTextResponse(textResponse));

});

function createTextResponse(textResponse){
  let response = {
    "fulfillmentText": "This is a text response",
    "fulfillmentMessages": [
      {
        "text": {
          "text": [
            textResponse
          ]
        }
      }
    ],
    "source": "example.com",
    "payload": {
      "google": {
        "expectUserResponse": true,
        "richResponse": {
          "items": [
            {
              "simpleResponse": {
                "textToSpeech": "this is a simple response"
              }
            }
          ]
        }
      },
      "facebook": {
        "text": "Hello, Facebook!"
      },
      "slack": {
        "text": "This is a text response for Slack."
      }
    }
  }
  return response;
}

module.exports = router;