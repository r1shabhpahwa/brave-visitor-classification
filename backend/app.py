import os
import re

import nltk
import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from keybert import KeyBERT
from openai import OpenAI

app = Flask(__name__)

def scrape_content(url):
    """
    Scrapes content from the URL.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        # Remove script and style elements
        for script_or_style in soup(['script', 'style']):
            script_or_style.decompose()
        content = soup.get_text(separator=' ')
        return content.strip()
    except requests.exceptions.RequestException as e:
        return str(e)

def preprocess_text(text):
    """
    Preprocesses the text by tokenizing, removing stop words, and non-alphabetic characters.
    """
    nltk.download('punkt')
    nltk.download('stopwords')
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    stop_words = set(stopwords.words('english'))

    # Remove non-alphabetic characters and convert to lowercase
    text = re.sub('[^a-zA-Z\s]', '', text)
    text = text.lower()

    # Tokenize and remove stop words
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words]
    preprocessed_text = ' '.join(tokens)
    return preprocessed_text

def extract_keywords(text, num_keywords=10):
    """
    Extracts keywords from the text using KeyBERT.
    """
    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(text, top_n=num_keywords)
    return keywords

def generate_questions_with_ai(keywords):
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY")
    )

    # Construct the prompt using the keywords
    prompt = (
        "The following keywords were extracted from the website content to help you understand the context of the website:\n"
        f"{', '.join([kw[0] for kw in keywords])}\n\n"
        "Create three straightforward multiple-choice questions to categorize visitors by industry or interest. "
        "Make sure the questions are simple and the options are short and concise. "
        "Each question should include four answer choices (a, b, c, d) that represent different user profiles. "
        "Format the response as follows:\n"
        "Question <number>: <question_text>\n"
        "a) <option_1>\n"
        "b) <option_2>\n"
        "c) <option_3>\n"
        "d) <option_4>\n"
        "...\n"
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You generate engaging questions and multiple choice options based on given topics to categorize users."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="gpt-4o-mini",
    )

    # Extract the generated questions from the response
    questions = chat_completion.choices[0].message.content.strip()
    return questions

def parse_questions_to_json(input_text):
    questions_list = []
    question_pattern = r'Question \d+: (.*?)\n(a\) .*?)\n(b\) .*?)\n(c\) .*?)\n(d\) .*?)(?=\n|\Z)'
    matches = re.finditer(question_pattern, input_text, re.DOTALL)

    for match in matches:
        question_text = match.group(1).strip()
        options = [match.group(i).strip() for i in range(2, 6)]
        options = [re.sub(r'^[a-d]\)\s*', '', option) for option in options]

        question_dict = {
            "question": question_text,
            "options": options
        }
        questions_list.append(question_dict)

    return questions_list

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"error": "URL is required"}), 400

    content = scrape_content(url)
    if not content:
        return jsonify({"error": "Failed to scrape content from the URL"}), 500

    preprocessed_content = preprocess_text(content)
    keywords = extract_keywords(preprocessed_content, num_keywords=10)
    questions_text = generate_questions_with_ai(keywords)

    if not questions_text:
        return jsonify({"error": "Failed to generate questions"}), 500

    questions_list = parse_questions_to_json(questions_text)
    return jsonify(questions_list), 200

if __name__ == "__main__":
    app.run(debug=True)
