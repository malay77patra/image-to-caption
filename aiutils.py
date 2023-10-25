# import sys
# from PIL import Image
# from transformers import BlipProcessor, BlipForConditionalGeneration

# # Specify your desired cache directory here
# cache_dir = "models"

# try:
#     processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir=cache_dir)
#     model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large", cache_dir=cache_dir)

#     image_path = sys.argv[2]
#     start_with = sys.argv[1]

#     raw_image = Image.open(image_path).convert('RGB')
    
#     if start_with:
#         inputs = processor(raw_image, start_with, return_tensors="pt")
#     else:
#         inputs = processor(raw_image, return_tensors="pt")

#     out = model.generate(**inputs)
#     caption = processor.decode(out[0], skip_special_tokens=True)
#     print(caption)

# except Exception as e:
#     print(e)

print("a sample caption")