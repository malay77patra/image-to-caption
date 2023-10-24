import sys
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

# Specify your desired cache directory here
cache_dir = "models"

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir=cache_dir)
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir=cache_dir)

def get_caption_from_image(img_url: str) -> str:
    try:
        raw_image = Image.open(img_url).convert('RGB')
        inputs = processor(raw_image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Not enough parameters given \nUsage: python aiutils.py <start_with> <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    start_with = sys.argv[2]
    try:
        raw_image = Image.open(image_path).convert('RGB')
        if start_with:
            inputs = processor(raw_image, start_with, return_tensors="pt")
        else:
            inputs = processor(raw_image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
    except:
        caption = "Some error occured"

    print(caption)
