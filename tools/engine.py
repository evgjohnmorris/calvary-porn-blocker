import os
import sys
import json
import shutil
import argparse

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

DIRS_TO_CREATE = [
    "apps/browser-ext",
    "apps/desktop-client",
    "apps/mobile-client",
    "packages/core-engine",
    "packages/ml-vision",
    "infrastructure/docker",
    "infrastructure/terraform",
    "tools"
]

def scaffold():
    print("Scaffolding Universal Pornography Blocker Architecture...")
    for d in DIRS_TO_CREATE:
        path = os.path.join(ROOT_DIR, d)
        os.makedirs(path, exist_ok=True)
        # Create a basic package.json for packages and apps
        if d.startswith("apps/") or d.startswith("packages/"):
            name = d.split("/")[1]
            pkg_path = os.path.join(path, "package.json")
            if not os.path.exists(pkg_path):
                with open(pkg_path, "w") as f:
                    json.dump({"name": f"@pb/{name}", "version": "1.0.0", "private": True}, f, indent=2)
        print(f"[OK] Created {d}")
        
    # Create root package.json for pnpm workspaces
    root_pkg = os.path.join(ROOT_DIR, "package.json")
    if not os.path.exists(root_pkg):
        with open(root_pkg, "w") as f:
            json.dump({
                "name": "porn-blocker-workspace",
                "private": True,
                "scripts": {
                    "build": "pnpm -r build",
                    "clean": "pnpm -r clean"
                }
            }, f, indent=2)
        print("[OK] Created Root package.json")
        
    # Create pnpm-workspace.yaml
    workspace_file = os.path.join(ROOT_DIR, "pnpm-workspace.yaml")
    if not os.path.exists(workspace_file):
        with open(workspace_file, "w") as f:
            f.write("packages:\n  - 'apps/*'\n  - 'packages/*'\n")
        print("[OK] Created pnpm-workspace.yaml")
        
    print("[DONE] Scaffolding Complete!")

def clean():
    print("Cleaning node_modules and build folders...")
    for root, dirs, files in os.walk(ROOT_DIR):
        if 'node_modules' in dirs:
            path = os.path.join(root, 'node_modules')
            shutil.rmtree(path, ignore_errors=True)
            print(f"🗑️ Removed {path}")
        if 'dist' in dirs:
            path = os.path.join(root, 'dist')
            shutil.rmtree(path, ignore_errors=True)
            print(f"🗑️ Removed {path}")
    print("[DONE] Clean Complete!")

def main():
    parser = argparse.ArgumentParser(description="Universal Pornography Blocker Project Engine")
    parser.add_argument("command", choices=["scaffold", "clean", "build"], help="Command to execute")
    parser.add_argument("--target", help="Target app or package to build", default=None)
    
    args = parser.parse_args()
    
    if args.command == "scaffold":
        scaffold()
    elif args.command == "clean":
        clean()
    elif args.command == "build":
        if args.target:
            print(f"Building {args.target}... (Implementation placeholder)")
        else:
            print("Building all packages... (Implementation placeholder)")

if __name__ == "__main__":
    main()
