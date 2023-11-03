from gradio_client import Client

client = Client("https://malay-91418-image-info.hf.space/--replicas/ljhkq/")

def get_caption(img_url, txt):
    result = client.predict(
            img_url,
            txt,
            api_name="/predict"
    )
    return result