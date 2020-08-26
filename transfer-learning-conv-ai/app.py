from flask import Flask, request
from interact import get_answer

app = Flask(__name__)

history = []

@app.route('/talk')
def talk():
    text = request.args.get('text')
    return get_answer(history, text)