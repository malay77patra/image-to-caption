import requests
from dotenv import load_dotenv
import os
from googletrans import Translator

load_dotenv()
token = os.getenv("TOKEN")
if not token:
    print("please make .env file with TOKEN=<your higging face token>\nsee .env.example file and rename it to .env after putting your token")
    exit()

API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
headers = {"Authorization": f"Bearer {token}"}


def get_caption(image_bin_data, lang):
    response = requests.post(API_URL, headers=headers, data=image_bin_data)
    caption = response.json()[0]["generated_text"].replace("arafed", "")
    translator = Translator()
    translated_caption = translator.translate(caption, dest=lang).text
    return translated_caption

