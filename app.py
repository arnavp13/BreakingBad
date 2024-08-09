from flask import Flask, render_template, jsonify, request
import requests
import random
import math

app = Flask(__name__)


def get_random_quote():
    url = 'https://api.breakingbadquotes.xyz/v1/quotes'
    response = requests.get(url)
    quote_data = response.json()[0]
    return quote_data['quote'], quote_data['author']


def blank_out_words(quote, percentage=0.5):
    words = quote.split()
    num_to_blank = math.ceil(len(words) * percentage)
    indices = random.sample(range(len(words)), num_to_blank)
    blanked_indices = set(indices)

    for index in indices:
        words[index] = '_' * len(words[index])

    return ' '.join(words), blanked_indices


def reveal_word(quote, blanked_indices, original_quote):
    words = quote.split()
    original_words = original_quote.split()

    if blanked_indices:
        index_to_reveal = blanked_indices.pop()
        words[index_to_reveal] = original_words[index_to_reveal]

    return ' '.join(words), blanked_indices


def guess_quote():
    original_quote, author = get_random_quote()
    quote, blanked_indices = blank_out_words(original_quote)

    print(f"\nQuote: \"{quote}\"")
    print("Who said this?")

    while True:
        guess = input()
        while len(guess) < 3:
            print("Guess has to be at least 3 letters long")
            print("\nTry Again")
            guess = input()
        if guess.lower() in author.lower():
            print(f"Correct! It was {author}.")
            break
        else:
            print("Incorrect!")
            if blanked_indices:
                quote, blanked_indices = reveal_word(
                    quote, blanked_indices, original_quote)
                print(f"Here's an updated quote: \"{quote}\"")
                print("\nGuess Again: ")
            else:
                print(
                    f"No more words to reveal. The correct answer was {author}.")
                break


globalquote = ""
globalauthor = ""
globalblanks = ""
globalindex = set()  # Initialize as an empty set to store blank indices


@app.route('/')
def index():
    global globalquote  # Declare that we're using the global variables
    global globalauthor

    quote, author = get_random_quote()
    globalquote = quote
    globalauthor = author
    return render_template('index.html', quote=quote, author=author)


@app.route('/blank_quote')
def blank_quote():
    global globalblanks
    global globalindex

    words = globalquote.split()
    num_to_blank = len(words) // 2
    indices_to_blank = random.sample(range(len(words)), num_to_blank)
    globalindex = set(indices_to_blank)  # Update global variable with blank indices

    blanked_words = [
        word if i not in indices_to_blank else '_____' for i, word in enumerate(words)]
    blanked_quote = ' '.join(blanked_words)
    globalblanks = blanked_quote
    return jsonify({'quote': blanked_quote, 'author': globalauthor, 'blanks': list(globalindex)})


@app.route('/check_guess', methods=['POST'])
def check_guess():
    global globalblanks, globalindex, globalauthor

    data = request.json
    guess = data['guess']
    author = data['author']
    
    # Reveal a word only if the guess is incorrect
    if guess.lower() not in author.lower():
        new_blanks, updated_indices = reveal_word(globalblanks, globalindex, globalquote)
        globalblanks = new_blanks
        globalindex = updated_indices
    
        return jsonify({
            'correct': False,
            'message': globalblanks
        })
    else:
        return jsonify({
            'correct': True,
            'message': f"Correct! The author was {author}."
        })




if __name__ == "__main__":
    app.run(debug=True)

'''if __name__ == "__main__":
    while True:
        guess_quote()
        play_again = input("\nDo you want to try another quote? (yes/no): ").lower()
        if play_again != 'yes':
            break
'''
