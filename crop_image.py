from PIL import Image
import os

img_path = r"c:\Proyectos\Gestion compras\public\nexatech-logo.png"

try:
    img = Image.open(img_path)
    print(f"Original size: {img.size}")
    
    # Get bounding box of non-zero alpha
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Convert to RGBA
        img = img.convert("RGBA")
        
        # Get bounding box
        bbox = img.getbbox()
        if bbox:
            print(f"Content bounding box: {bbox}")
            # Crop image to bounding box
            cropped = img.crop(bbox)
            cropped.save(img_path)
            print(f"Saved cropped image, new size: {cropped.size}")
        else:
            print("No bounding box found (completely transparent or error)")
    else:
        print(f"Image mode {img.mode} doesn't have transparency")

except Exception as e:
    print(f"Error: {e}")
