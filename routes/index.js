var express = require('express');
var router = express.Router();
var axios = require('axios');
const translate = require('@k3rn31p4nic/google-translate-api');



/* GET home page. */
router.get('/', function(req, res, next) {

  translate('Tu es incroyable!', { to: 'en' }).then(res => {
    console.info(res.text); // OUTPUT: You are amazing!
    var hasil = res.text;


    // res.render('index', { title: hasil });
  }).catch(err => {
    console.error(err);
  });

  var product = "MOCHI";
 
  var endpoint = 'http://localhost:3030/food-hanna/sparql';
  var query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX food: <http://www.paguyubankseusu.org/hanna/hanna-food.owl#>
  SELECT ?food_name
  WHERE {
    ?no food:has_name ?food_name;
    
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
        
        let textResponse = `Nama Makanan : ${foodArray}`;
        // res.render('index', { title: textResponse });
        // res.render('index', { title: hasil });


      //   translate('Ik spreek Engels', {to: 'en'}).then(res => {
      //     console.log(res.text);
      //     //=> I speak English
      //     console.log(res.from.language.iso);
      //     //=> nl
      // }).catch(err => {
      //     console.error(err);
      // });


        
  }).catch(err => {
    console.log(err);
  })
  
});

         

module.exports = router;
