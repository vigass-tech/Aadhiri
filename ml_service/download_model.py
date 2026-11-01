import os
import urllib.request
import sys

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)
TARGET_PATH = os.path.join(MODEL_DIR, "best.pt")
URL = "https://huggingface.co/tanmay9132/civic-eye-pothole-garbage/resolve/main/best.pt"

def download_progress(count, block_size, total_size):
    percent = int(count * block_size * 100 / total_size)
    downloaded_mb = (count * block_size) / (1024 * 1024)
    total_mb = total_size / (1024 * 1024)
    sys.stdout.write(f"\rDownloading Civic Eye YOLOv8 weights: {percent}% ({downloaded_mb:.1f}MB / {total_mb:.1f}MB)")
    sys.stdout.flush()

if __name__ == "__main__":
    print(f"Target model path: {TARGET_PATH}")
    if os.path.exists(TARGET_PATH) and os.path.getsize(TARGET_PATH) > 1000000:
        print(f"Model already downloaded: {TARGET_PATH} ({os.path.getsize(TARGET_PATH)/(1024*1024):.2f} MB)")
    else:
        print(f"Connecting to Hugging Face repository tanmay9132/civic-eye-pothole-garbage...")
        urllib.request.urlretrieve(URL, TARGET_PATH, reporthook=download_progress)
        print(f"\nDownload completed successfully: {TARGET_PATH}")
