import os
import json

# --- CONFIGURATION ---
image_folder = './images'  # Path to your images
output_file = 'timeline-data.json' # Where to save the output

# Valid extensions to look for
valid_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', 'JPG')

# The list that will hold our data
timeline_data = []

print(f"📂 Scanning folder: {image_folder}...")

# 1. Get all files and sort them (so 1.jpg comes before 2.jpg)
try:
    files = sorted(os.listdir(image_folder))
except FileNotFoundError:
    print(f"❌ Error: Folder '{image_folder}' not found.")
    exit()

# 2. Loop through files
entry_id = 1
for filename in files:
    if filename.lower().endswith(valid_extensions):
        
        # Create the dictionary object for this photo
        entry = {
            "id": entry_id,
            "date": "TODO: Add Date",
            "header": "", # Leave empty if you don't want a header
            "title": f"Memory #{entry_id}",
            "caption": "TODO: Write a beautiful caption here.",
            "src": f"./images/{filename}" # Automatically creates the path
        }
        
        timeline_data.append(entry)
        entry_id += 1

# 3. Print or Save the Result
json_output = json.dumps(timeline_data, indent=4)

# Option A: Print to console (so you can copy-paste)
print("\n✅ Generated JSON:\n")
print(json_output)

# Option B: Save directly to a file (Be careful, this overwrites!)
with open(output_file, 'w') as f:
    f.write(json_output)
    print(f"\n✅ Saved to {output_file}")