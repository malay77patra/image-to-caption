from flask import Flask, render_template, request, send_from_directory, jsonify, request
import subprocess
import requests
import os
from uuid import uuid4


app = Flask(__name__)
uploads_dir = 'uploads'


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
        file.save(os.path.join(uploads_dir, filename))
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
            with open(os.path.join(uploads_dir, filename), 'wb') as f:
                f.write(response.content)
            return jsonify({'fileid': filename}), 200
        else:
            return jsonify({'error': 'Failed to download image from the provided URL.'}), 404
    except Exception as e:
        return jsonify({'error': f'An error occurred'}), 404
    
@app.route('/uploads/<img_name>')
def get_file(img_name):
    if os.path.exists(os.path.join(uploads_dir, img_name)):
        return send_from_directory(uploads_dir, img_name)
    else:
        return "File not found", 404

    
@app.route("/dashboard")
def dashboard():
    image_id = request.args.get('id')
    return render_template("dashboard.html", image_id=image_id)

@app.route("/generate-caption", methods=["POST"])
def generate_caption():
    try:
        data = request.get_json()
        image_path = f"/uploads/{data['fileid']}"
        start_with = data['starttxt']
        print("Analyzing the image...")
        process = subprocess.Popen(['python', 'aiutils.py', start_with, image_path], stdout=subprocess.PIPE)
        output, _ = process.communicate()
        caption = output.decode('utf-8').strip()
        print("Success !\nCaption:", caption)
        return jsonify({"caption": caption})
    except Exception as e:
        print(e)
        return jsonify({"error": "something went wrong"})
    

if __name__ == '__main__':
    app.run(port=3000, debug=True)