import os
from PIL import Image
from pdf2image import convert_from_path

pdf_path = "/mnt/documents/revamp-tracker.pdf"
output_dir = "/tmp/browser/pdf_qa"
os.makedirs(output_dir, exist_ok=True)

try:
    images = convert_from_path(pdf_path)
    for i, image in enumerate(images):
        image.save(f"{output_dir}/page_{i+1}.png", "PNG")
    print(f"Saved {len(images)} pages to {output_dir}")
except Exception as e:
    print(f"Error: {e}")
