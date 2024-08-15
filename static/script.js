let currentAuthor;
let correct = 0;
let wrong = 0;


function blankQuote() {
  fetch("/blank_quote")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("quote").innerText = data.quote;
      document.getElementById("author").innerText = `— ${data.author}`;
      document.getElementById("myButton").style.display = "none";
      currentAuthor = data.author; // Store the author
    });
}

function makeGuess() {
  let guess = document.getElementById("guessInput").value;

  if (guess.length < 3) {
    document.getElementById("guessResult").textContent =
      "Your guess must be at least 3 characters long.";
    return;
  }

  axios
    .post("/check_guess", {
      guess: guess,
      author: currentAuthor,
    })
    .then(function (response) {
      document.getElementById("quote").textContent = response.data.message;

      if (response.data.correct) {
        // Correct guess: Show author, hide input and buttons
        document.getElementById("correct").innerText = ++correct;

        document.getElementById("author").innerText = `— ${currentAuthor}`;
        document.getElementById("author").style.display = "";
        document.getElementById("guessInput").style.display = "none";
        document.getElementById("myButton").style.display = "none";
        document.getElementById("guessResult").style.display = "none";
        document.getElementById("makeGuess").style.display = "none";
        document.getElementById("restartButton").style.display = ""; // Show restart button
      } else if (
        !response.data.correct &&
        !response.data.message.includes("____")
      ) {
        document.getElementById("wrong").innerText = ++wrong;
        // Incorrect guess with no more blanks: Hide input and buttons
        document.getElementById("guessInput").style.display = "none";
        document.getElementById("myButton").style.display = "none";
        document.getElementById("guessResult").style.display = "none";
        document.getElementById("makeGuess").style.display = "none";
        document.getElementById("restartButton").style.display = ""; // Show restart button
      } else {
        // Incorrect guess but with blanks remaining
        document.getElementById("guessResult").textContent = "Try again!";
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
      document.getElementById("guessResult").textContent =
        "An error occurred. Please try again.";
    });

  document.getElementById("guessInput").value = "";
}

function restartGame() {
  fetch("/restart")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("quote").innerText = data.quote;
      document.getElementById("author").innerText = `— ${data.author}`;
      document.getElementById("myButton").style.display = "";
      document.getElementById("guessInput").style.display = "";
      document.getElementById("myButton").style.display = "none";
      document.getElementById("guessResult").style.display = "";
      document.getElementById("makeGuess").style.display = "";
      document.getElementById("restartButton").style.display = "none"; // Hide restart button
      currentAuthor = data.author; // Store the author
    });
}




process.stdin.setEncoding("utf8");
const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const bcrypt = require("bcrypt");
const port = process.env.PORT || 4000;

const { MongoClient, ServerApiVersion } = require("mongodb");

// Use environment variable for MongoDB URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://apal:weather@cluster0.bn5qnxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const databaseAndCollection = {
  db: "results",
  collection: "results",
};

