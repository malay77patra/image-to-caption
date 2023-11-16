import requests
from dotenv import load_dotenv
import os

load_dotenv()
token = os.getenv("TOKEN")
if not token:
    print("please make .env file with TOKEN=<your higging face token>\nPlease see .env.example file and rename it to .env after putting your token")
    exit()

API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
headers = {"Authorization": f"Bearer {token}"}

def get_caption(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()[0]["generated_text"]
