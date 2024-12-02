import os
import requests
import cairosvg
from PIL import Image, ImageEnhance
from io import BytesIO
import base64

API_KEY = '67bc9085dfd47a9a6df5409995e66874'
def convert_to_raw_url(github_url):
    if 'github.com' not in github_url or '/blob/' not in github_url:
        raise ValueError(f"Invalid GitHub URL format: {github_url}")
    parts = github_url.split('/blob/')
    raw_url = parts[0].replace('github.com', 'raw.githubusercontent.com') + '/' + parts[1]
    return raw_url

def download_svg(raw_url):
    response = requests.get(raw_url)
    if response.status_code != 200:
        raise Exception(f"Failed to download {raw_url}. Status Code: {response.status_code}")
    return response.content

def convert_svg_to_png(svg_content):
    png_data = cairosvg.svg2png(bytestring=svg_content, dpi=1200, output_height=1200)
    return png_data

def adjust_image(png_data):
    image = Image.open(BytesIO(png_data)).convert('RGBA')
    converter = ImageEnhance.Color(image)
    image = converter.enhance(0)  # Set saturation to 0% (grayscale)
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1)  # Set brightness to 100%
    return image

def upload_to_imgbb(api_key, image_path):
    with open(image_path, 'rb') as file:
        image_data = file.read()
    encoded_image = base64.b64encode(image_data).decode('utf-8')
    url = "https://api.imgbb.com/1/upload"
    payload = {
        'key': api_key,
        'image': encoded_image
    }
    response = requests.post(url, data=payload)
    if response.status_code != 200:
        raise Exception(f"Failed to upload {image_path}. Status Code: {response.status_code}")
    response_json = response.json()
    if not response_json.get('success'):
        raise Exception(f"Upload failed for {image_path}. Response: {response.text}")
    image_url = response_json['data']['url']
    return image_url

def main():
    github_urls = [
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Ahand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Bhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Chand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Dhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Ehand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Fhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Ghand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Hhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Ihand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Jhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Khand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Lhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Mhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Nhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Ohand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Phand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Qhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Rhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Shand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Thand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Uhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Vhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Whand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Xhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Yhand.svg",
        "https://github.com/syauqy/handsign-tensorflow/blob/master/components/handimage/Zhand.svg"
    ]

    hands_dir = 'hands'
    if not os.path.exists(hands_dir):
        os.makedirs(hands_dir)

    ibb_urls = []

    for url in github_urls:
        try:
            raw_url = convert_to_raw_url(url)
            filename = raw_url.split('/')[-1]
            letter = filename[0].upper()
            svg_content = download_svg(raw_url)
            png_data = convert_svg_to_png(svg_content)
            image = adjust_image(png_data)
            output_path = os.path.join(hands_dir, f"{letter}.png")
            image.save(output_path)
            image_url = upload_to_imgbb(API_KEY, output_path)
            ibb_urls.append(image_url)
            print(f"Processed and uploaded {letter}.png successfully.")
        except Exception as e:
            print(f"An error occurred while processing {url}: {e}")

    if ibb_urls:
        with open('hands.txt', 'w') as f:
            for link in ibb_urls:
                f.write(f"{link}\n")
        print("All Imgbb URLs have been written to hands.txt")
    else:
        print("No images were uploaded to Imgbb.")

if __name__ == "__main__":
    main()
