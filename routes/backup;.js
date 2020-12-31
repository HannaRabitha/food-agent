var express = require('express');
var axios = require('axios');
var router = express.Router();


router.post('/', function(req, res, next) {
  let product = req.body.queryResult.parameters["product"];
  
  var endpoint = 'http://localhost:3030/food-hanna/sparql';
  var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://www.paguyubankseusu.org/hanna/hanna-food.owl#>
  SELECT ?food_name 
  WHERE {
    ?no food:has_name ?food_name;
        
    FILTER regex(?food_name, "${product}", 'i')
  }`;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
  
  var foodArray = [];

  axios
      .get(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;
        
        for(var i in data) {    
          var item = data[i];  
              foodArray[i] = item.food_name.value;
        }

    let textResponse = `Kinds of ${product}: ${foodArray}`;
    res.send(createTextResponse(textResponse));
    res.render('index', { title: textResponse });

  }).catch(err => {
    console.log(err);
  })

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