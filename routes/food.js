var express = require('express');
var axios = require('axios');
var router = express.Router();
const dfff = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



router.get('/', function(req, res, next){
    res.send("Hello World, this food.js")
});



router.post('/', function(req, res, next) {

  const agent = new dfff.WebhookClient({
    request : req,
    response : res
  });

  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));


  let intentMap = new Map();
  intentMap.set('webhookDemo', Demo);
  intentMap.set('getFood', GetFood);
  agent.handleRequest(intentMap);

});


 
function Demo (agent) {
  agent.add("sending response from webhook server")
}


function GetFood (agent) {
  var product = agent.parameters["product"];
  
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

    return getFood(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;
        
        for(var i in data) {    
          var item = data[i];  
              foodArray[i] = item.food_name.value;
        }

    let bot_response = `Food is : ${foodArray}`;

    console.log(bot_response);
    agent.add(bot_response);
    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
      agent.add(bot_response);
  });
};


function getFood(queryUrl) {
  const axios = require('axios');
  return axios
      .get(queryUrl);
}





module.exports = router;