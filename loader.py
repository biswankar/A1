from PIL import Image
from pillow_heif import register_heif_opener
import os

# 1. Register HEIC opener so Pillow understands these files
register_heif_opener()

# --- CONFIGURATION ---
folder_path = r'./images' 

# Extensions to look for (Added .heic)
valid_extensions = ('.png', '.jpeg', '.webp', '.bmp', '.tiff', '.heic', '.HEIC')

print(f"Scanning folder: {folder_path}...")

for filename in os.listdir(folder_path):
    if filename.lower().endswith(valid_extensions):
        try:
            file_path = os.path.join(folder_path, filename)
            
            # 2. Open the image
            with Image.open(file_path) as img:
                # 3. Convert to RGB
                rgb_im = img.convert('RGB')
                
                # 4. Create new filename (e.g., photo.HEIC -> photo.jpg)
                new_filename = os.path.splitext(filename)[0] + '.jpg'
                save_path = os.path.join(folder_path, new_filename)
                
                # 5. Save as JPG
                rgb_im.save(save_path, quality=90)
                print(f"✅ Converted: {filename} -> {new_filename}")

        except Exception as e:
            print(f"❌ Error converting {filename}: {e}")

print("Done! You can now delete the .HEIC files.")