let currentAuthor;

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
        document.getElementById("author").innerText = `— ${currentAuthor}`;
        document.getElementById("author").style.display = "block";
        document.getElementById("guessInput").style.display = "none";
        document.getElementById("myButton").style.display = "none";
        document.getElementById("guessResult").style.display = "none";
        document.getElementById("makeGuess").style.display = "none";
        document.getElementById("restartButton").style.display = "block"; // Show restart button
      } else if (
        !response.data.correct &&
        !response.data.message.includes("____")
      ) {
        // Incorrect guess with no more blanks: Hide input and buttons
        document.getElementById("guessInput").style.display = "none";
        document.getElementById("myButton").style.display = "none";
        document.getElementById("guessResult").style.display = "none";
        document.getElementById("makeGuess").style.display = "none";
        document.getElementById("restartButton").style.display = "block"; // Show restart button
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
  fetch("/blank_quote")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("quote").innerText = data.quote;
      document.getElementById("author").innerText = `— ${data.author}`;
      document.getElementById("myButton").style.display = "none";
      document.getElementById("guessInput").style.display = "block";
      document.getElementById("myButton").style.display = "none";
      document.getElementById("guessResult").style.display = "block";
      document.getElementById("restartButton").style.display = "none"; // Hide restart button
      currentAuthor = data.author; // Store the author
    });
}
