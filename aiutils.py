import requests
import sys
import json

# Load the config.json file
def load_config_file(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Load the config file
config = load_config_file("config.json")

API_URL = config["api_url"]
headers = config["headers"]

def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()[0]["generated_text"]

if __name__ == "__main__":
    try:
        start_caption_with = sys.argv[1]
        image_path = sys.argv[2]
        print(query(image_path))
    except Exception as e:
        print(e)