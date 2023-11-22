import requests
from dotenv import load_dotenv
import os
from gtts import gTTS 

language = 'en'

load_dotenv()
token = os.getenv("TOKEN")
if not token:
    print("please make .env file with TOKEN=<your higging face token>\nsee .env.example file and rename it to .env after putting your token")
    exit()

API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
headers = {"Authorization": f"Bearer {token}"}

def get_caption(filename):
    image_filepath = os.path.join("uploads", filename)
    audio_filepath = f"./uploads/{os.path.splitext(filename)[0]}.mp3"
    with open(image_filepath, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    response_text = response.json()[0]["generated_text"].replace("arafed", "")
    audio = gTTS(text=response_text, lang=language, slow=False)
    with open(audio_filepath, "wb") as f:
        audio.write_to_fp(f)
    return response_text
