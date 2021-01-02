var express = require('express');
var axios = require('axios');
var router = express.Router();
const dfff = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

router.get('/', function(req, res, next){
    res.send("Hello World, this food-idn.js")
});



router.post('/', function(req, res, next) {
  const agent = new dfff.WebhookClient({
    request : req,
    response : res
  });

  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));


  let intentMap = new Map();
  intentMap.set('webhookTest', Test);
  intentMap.set('getFood', getFood);
  intentMap.set('getPopulerFood', getPopulerFood);
  intentMap.set('getIngredients', getIngredients);
  intentMap.set('getSteps', getSteps);
  intentMap.set('getRecipe', getRecipe);
  intentMap.set('getStuff', getStuff);
  agent.handleRequest(intentMap);

});



 
function Test (agent) {
  agent.add("sending response from webhook server food-idn.js")
}


function getData(queryUrl) {
    const axios = require('axios');
    return axios
        .get(queryUrl);
  }


  function getPopulerFood (agent) {
  var endpoint = 'http://localhost:3030/food-idn/sparql';
  var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://localhost:3030/hanna/food-idn#>
  SELECT DISTINCT ?food_name ?like
  WHERE {
    ?no rdfs:label ?food_name;
          food:hasLike ?like;
  }
  ORDER BY DESC(?like)
  LIMIT 10
  `;

  var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";

  var foodArray = [];
  var numberArray= [];

    return getData(queryUrl)
      .then(aRes => {
        console.log('data ',aRes.data.results.bindings)
        var data = aRes.data.results.bindings;
        
        for(var i in data) {    
          var item = data[i];  
              foodArray[i] = item.food_name.value;
              numberArray[i] = item.like.value;
              agent.add('- ' + foodArray[i]);
        }

    }).catch (error => {
      console.log("Something is wrong  !! ");
      console.log(error);
  });
};

function getFood (agent) {
      var foodName = agent.parameters["foodLike"];
      
      var endpoint = 'http://localhost:3030/food-idn/sparql';
      var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX food: <http://localhost:3030/hanna/food-idn#>
      SELECT DISTINCT ?food_name ?like
      WHERE {
        ?no rdfs:label ?food_name;
              food:hasLike ?like;
              FILTER regex(?food_name, "${foodName}", "i")
      }
      ORDER BY DESC(?like)
      LIMIT 10
      `;
    
      var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    
      var foodArray = [];
      var numberArray= [];
    
        return getData(queryUrl)
          .then(aRes => {
            console.log('data ',aRes.data.results.bindings)
            var data = aRes.data.results.bindings;
            
            agent.add(`Rekomendasi Masakan  ${foodName} : `);
            for(var i in data) {    
              var item = data[i];  
                  foodArray[i] = item.food_name.value;
                  numberArray[i] = item.like.value;
                  agent.add('- ' + foodArray[i]);
            }
    
        }).catch (error => {
          console.log("Something is wrong  !! ");
          console.log(error);
          agent.add("Data tidak ditemukan");
      });
    };


function getIngredients (agent) {
      var foodName = agent.parameters["foodName"];

      console.info(foodName);
      
      var endpoint = 'http://localhost:3030/food-idn/sparql';
      var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX food: <http://localhost:3030/hanna/food-idn#>
      SELECT DISTINCT ?food_name ?ing ?like ?url
      WHERE {
        ?no rdfs:label ?food_name;
            food:hasIng ?ing;
            food:hasURL ?url;
            food:hasLike ?like.
        FILTER regex(?food_name, "${foodName}", "i")
      }
      ORDER BY DESC(?like)
      `;
    
      var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
    
        return getData(queryUrl)
          .then(aRes => {
            console.log('data ',aRes.data.results.bindings[0])
            var data = aRes.data.results.bindings[0];
            var food = data.food_name.value;
            var ingredients= data.ing.value;
            var link= data.url.value;
            var ing = ingredients.replace(/--/g , "\n");
            agent.add('Bahan Makanan ' + food);
            agent.add(ing);
            agent.add("link : " +link);
       
        }).catch (error => {
          console.log("Something is wrong  !! ");
          console.log(error);
          agent.add('Makanan tidak ditemukan');
      });
    };


    function getSteps (agent) {
        var foodName = agent.parameters["foodName"];
  
        console.info(foodName);
        
        var endpoint = 'http://localhost:3030/food-idn/sparql';
        var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX food: <http://localhost:3030/hanna/food-idn#>
        SELECT DISTINCT ?food_name ?like ?url ?step
        WHERE {
          ?no rdfs:label ?food_name;
              food:hasStep ?step;
              food:hasURL ?url;
              food:hasLike ?like.
          FILTER regex(?food_name, "${foodName}", "i")
        }
        ORDER BY DESC(?like)
        `;
      
        var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
      
          return getData(queryUrl)
            .then(aRes => {
              console.log('data ',aRes.data.results.bindings[0])
              var data = aRes.data.results.bindings[0];
              var food = data.food_name.value;
              var step= data.step.value;
              var link= data.url.value;
              var steps = step.replace(/--/g , "\n");
              agent.add('Cara membuat ' + foodName);
              agent.add(steps);
              agent.add("link : " +link);
         
          }).catch (error => {
            console.log("Something is wrong  !! ");
            console.log(error);
            agent.add('Makanan tidak ditemukan');
        });
      };


      function getRecipe (agent) {
        var foodName = agent.parameters["foodName"];
  
        console.info(foodName);
        
        var endpoint = 'http://localhost:3030/food-idn/sparql';
        var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX food: <http://localhost:3030/hanna/food-idn#>
        SELECT DISTINCT ?food_name ?ing ?step ?like ?url
        WHERE {
          ?no rdfs:label ?food_name;
              food:hasIng ?ing;
              food:hasStep ?step;
              food:hasURL ?url;
              food:hasLike ?like.
          FILTER regex(?food_name, "${foodName}", "i")
        }
        ORDER BY DESC(?like)
        `;
      
        var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
      
          return getData(queryUrl)
            .then(aRes => {
              console.log('data ',aRes.data.results.bindings[0])
              var data = aRes.data.results.bindings[0];

              var food = data.food_name.value;
              var ingredients= data.ing.value;
              var step = data.step.value;
              var link= data.url.value;
              var like= data.like.value;

              var ing = ingredients.replace(/--/g , "\n");
              var steps = step.replace(/--/g , "\n");
              agent.add('Resep ' + food);
              agent.add("Bahan-bahan : \n" +ing);
              agent.add("Cara Membuat : \n" +steps);
              agent.add("link : " +link);
              agent.add(+like + "  orang menyukai ini");
         
          }).catch (error => {
            console.log("Something is wrong  !! ");
            console.log(error);
            agent.add('Makanan tidak ditemukan');
        });
      };



      function getStuff (agent) {
        var foodName = agent.parameters["foodName"];
        var ing_stuff = agent.parameters["stuff"];
  
        console.info(foodName);
        console.info(ing_stuff);
        
        var endpoint = 'http://localhost:3030/food-idn/sparql';
        var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX food: <http://localhost:3030/hanna/food-idn#>
       
        SELECT DISTINCT ?foodname ?ing 
        WHERE {
          ?no rdfs:label ?foodname;
              food:hasIng ?ing;
              food:hasLike ?like.
            FILTER regex(?foodname, "${foodName}", "i")
          FILTER (!regex(?ing, "${ing_stuff}","i")) 
        }
        ORDER BY DESC(?like)
        `;
      
        var queryUrl = endpoint + "?query=" + encodeURIComponent(query) + "&format=json";
      
          return getData(queryUrl)
            .then(aRes => {
              console.log('data ',aRes.data.results.bindings[0])
              var data = aRes.data.results.bindings[0];
              
              var food = data.food_name.value;
              var ingredients= data.ing.value;
            
              var ing = ingredients.replace(/--/g , "\n");

              agent.add(food);
              agent.add("Bahan : " +ing);
         
          }).catch (error => {
            console.log("Something is wrong  !! ");
            console.log(error);
            agent.add('Makanan tidak ditemukan');
        });
      };




module.exports = router;