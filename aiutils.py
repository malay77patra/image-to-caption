from gradio_client import Client

client = Client("https://malay-91418-image-info.hf.space/--replicas/mrnzp/")

def get_caption(txt, img_url):
    result = client.predict(
            txt,
            img_url,
            api_name="/predict"
    )
    return result