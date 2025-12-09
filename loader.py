from PIL import Image
import os

# --- CONFIGURATION ---
# Replace this with the path to your folder
# Use 'r' before the string to handle Windows backslashes correctly
folder_path = r'./images' 

# Extensions to look for (you can add more like .heic if needed)
valid_extensions = ('.png', '.jpeg', '.webp', '.bmp', '.tiff', '.JPG', '.jpg')

print(f"Scanning folder: {folder_path}...")

for filename in os.listdir(folder_path):
    # Check if it's an image and NOT already a jpg
    if filename.lower().endswith(valid_extensions):
        try:
            file_path = os.path.join(folder_path, filename)
            
            # 1. Open the image
            with Image.open(file_path) as img:
                # 2. Convert to RGB (Crucial: removes transparency from PNGs so they can be JPG)
                rgb_im = img.convert('RGB')
                
                # 3. Create new filename (e.g., photo1.png -> photo1.jpg)
                new_filename = os.path.splitext(filename)[0] + '.jpg'
                save_path = os.path.join(folder_path, new_filename)
                
                # 4. Save
                rgb_im.save(save_path, quality=90)
                print(f"✅ Converted: {filename} -> {new_filename}")

        except Exception as e:
            print(f"❌ Error converting {filename}: {e}")

print("Done! You can now delete the old non-jpg files if you want.")