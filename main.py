from flask import Flask, render_template, request, send_from_directory, jsonify, request
import requests
from aiutils import get_caption


app = Flask(__name__)



@app.route('/', methods=['GET'])
def index():
    return render_template('dashboard.html')


@app.route('/assets/<asset_url>')
def get_asset(asset_url):
    return send_from_directory("./templates/assets", asset_url)


@app.route("/generate-caption", methods=["POST"])
def generate_caption():
    try:
        form_data = request.form.to_dict()
        file_data = request.files
        if not form_data and not file_data:
            return jsonify({"error": "Not sufficient data provided"})
        image_bin_data = file_data.get('image').read()
        lang = form_data.get('lang')
        caption = get_caption(image_bin_data, lang)

        return jsonify({"caption": caption})
    except Exception as e:
        print(e)
        return jsonify({"error": f"error: {e}"})
    

@app.route("/favicon.ico")
def get_favicon():
    return send_from_directory("public", "favicon.ico")


if __name__ == '__main__':
    app.run(debug=True)
