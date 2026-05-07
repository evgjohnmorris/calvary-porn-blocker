import os
import json

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def generate_index():
    index = {
        "apps": [],
        "packages": []
    }
    
    for category in ["apps", "packages"]:
        category_path = os.path.join(ROOT_DIR, category)
        if not os.path.exists(category_path):
            continue
            
        for item in os.listdir(category_path):
            item_path = os.path.join(category_path, item)
            if os.path.isdir(item_path):
                pkg_json_path = os.path.join(item_path, "package.json")
                if os.path.exists(pkg_json_path):
                    try:
                        with open(pkg_json_path, "r") as f:
                            pkg_data = json.load(f)
                            index[category].append({
                                "name": pkg_data.get("name", item),
                                "path": f"{category}/{item}"
                            })
                    except Exception:
                        index[category].append({"name": item, "path": f"{category}/{item}"})

    index_path = os.path.join(ROOT_DIR, "project_index.json")
    with open(index_path, "w") as f:
        json.dump(index, f, indent=2)
        
    print(f"[OK] Generated project index at {index_path}")
    return index

def update_readme(index):
    readme_path = os.path.join(ROOT_DIR, "README.md")
    content = "# Universal Pornography Blocker\n\n## Project Architecture\n\n"
    
    content += "### Apps (Final Executables)\n"
    for app in index.get("apps", []):
        content += f"- **{app['name']}** (`{app['path']}`)\n"
        
    content += "\n### Packages (Shared Libraries)\n"
    for pkg in index.get("packages", []):
        content += f"- **{pkg['name']}** (`{pkg['path']}`)\n"
        
    with open(readme_path, "w") as f:
        f.write(content)
    print("[OK] Updated README.md with architectural map")

if __name__ == "__main__":
    print("Indexing Project Infrastructure...")
    index = generate_index()
    update_readme(index)
