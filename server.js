// Homework:  Web Scraper with Express, Handlebars, MongoDB and Cheerio
// UNC Bootcamp
// Charles Bowden

// Load Requires
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
// Our scraping tools
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set up for Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database Connection
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
// Set mongoose to use ES6 Promises
mongoose.Promise = Promise;
// Connect to Mongo
mongoose.connect("mongodb://localhost/mongoScraper");

// Routes

app.get("/", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle){
    var hbsObject = {
      articles: dbArticle
    };
    res.render("index", hbsObject);
  })
  .catch(function(err){
    res.json(err);
  })
});

// Route for Scraping
app.get('/scrape', function(req, res) {
  // First, grab the body of the html with request
  request('http://www.nytimes.com', function(error, response, html) {
    // Then, load html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);  
    $('h2.story-heading').each(function(i, element){
      var result = {};
      // Select the previous element
      result.title = $(element).children().text();
      result.link = $(element).children().attr("href");
      result.byline = $(element).parent().find(".byline").text();
      result.summary = $(element).parent().find(".summary").text();

      db.Article.create(result)
        .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
              return res.json(err);
          });
      });
  
      // Eventually add a redirect
      res.send("Scrape Complete");
    });
  });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
