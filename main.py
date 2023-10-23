from flask import Flask, render_template, request, send_from_directory, jsonify, request
import subprocess
import requests
import os
from uuid import uuid4


app = Flask(__name__)


def is_image_url(url):
    try:
        r = requests.head(url)
        if "content-type" in r.headers and r.headers["content-type"].split("/")[0]=="image":
            return True, r.headers["content-type"].split("/")[1]
        return False, None
    except:
        return False, None


@app.route('/', methods=['GET'])
def index():
    error = request.args.get('error')
    return render_template('index.html', error=error)

@app.route('/assets/<asset_url>')
def get_asset(asset_url):
    return send_from_directory("./templates/assets", asset_url)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part given'}), 404
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 404
    if file:
        filename = f"file-{uuid4()}.{file.filename.split('.')[-1]}"
        file.save(os.path.join("uploads", filename))
        return jsonify({'fileid': filename}), 200
    
@app.route('/upload-url', methods=['POST'])
def upload_url():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL not found'}), 404

    url = data['url']
    url_data = is_image_url(url)
    if not url_data[0]:
        return jsonify({'error': 'The provided URL is not an image'}), 404

    try:
        response = requests.get(url)
        if response.status_code == 200:
            filename = f"file-{uuid4()}.{url_data[1]}"
            with open(os.path.join("uploads", filename), 'wb') as f:
                f.write(response.content)
            return jsonify({'fileid': filename}), 200
        else:
            return jsonify({'error': 'Failed to download image from the provided URL.'}), 404
    except Exception as e:
        print(e)
        return jsonify({'error': f'An error occurred'}), 404
    

    
@app.route("/dashboard")
def dashboard():
    file_id = request.args.get('id')
    return f'File ID: {file_id}'

if __name__ == '__main__':
    app.run(port=3000, debug=True)
