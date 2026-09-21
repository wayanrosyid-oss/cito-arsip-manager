import os
import re

def get_buttons_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    pos = 0
    results = []
    while True:
        idx = content.find("<button", pos)
        if idx == -1:
            break
        i = idx + 7
        in_quote = None
        brace_depth = 0
        while i < len(content):
            ch = content[i]
            if in_quote:
                if ch == in_quote and content[i-1] != "\\":
                    in_quote = None
            else:
                if ch in ('"', "'", '`'):
                    in_quote = ch
                elif ch == '{':
                    brace_depth += 1
                elif ch == '}':
                    brace_depth -= 1
                elif ch == '>' and brace_depth == 0:
                    break
            i += 1
        tag = content[idx:i+1]
        line = content[:idx].count('\n') + 1
        cm = re.search(r'className=(?:"([^"]*)"|\{`([^`]*)`\}|\x27([^\x27]*)\x27|\{([^}]+)\})', tag, re.DOTALL)
        cls = ""
        if cm:
            cls = cm.group(1) or cm.group(2) or cm.group(3) or cm.group(4) or ""
        cls = " ".join(cls.split())
        results.append((line, cls, tag))
        pos = i + 1
    return results

files = [
    "src/App.tsx",
    "src/components/BatchDeleteModal.tsx",
    "src/components/CaptionStudioModal.tsx",
    "src/components/CloudSyncModal.tsx",
    "src/components/DeleteConfirmModal.tsx",
    "src/components/GitHubGuideModal.tsx",
    "src/components/ItineraryEditor.tsx",
    "src/components/ItineraryModal.tsx",
    "src/components/MediaKitView.tsx",
    "src/components/Navbar.tsx",
    "src/components/PamphletStudioModal.tsx",
    "src/components/PWAInstallButton.tsx",
    "src/components/TeamDataModal.tsx",
    "src/components/TeamInputView.tsx",
    "src/components/TimeDropdown.tsx",
    "src/components/TripDetail.tsx",
    "src/components/TripModal.tsx"
]

for f in files:
    btns = get_buttons_in_file(f)
    print(f"=== {f} ({len(btns)}) ===")
    for line, cls, tag in btns:
        radii = re.findall(r'rounded(?:-[a-z0-9]+)?', cls)
        shadows = re.findall(r'shadow(?:-[a-z0-9]+)?', cls)
        gradients = re.findall(r'bg-gradient[^\s]*', cls)
        print(f"  L{line} [r:{radii} s:{shadows} g:{gradients}]: {cls}")
