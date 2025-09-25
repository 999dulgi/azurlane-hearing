import json

# 파일 경로
ship_skin_path = 'public/ship_skin.json'
ship_skin_template_path = 'public/ship_skin_template.json'

# ship_skin_template.json에서 한국어 이름 로드
print(f"Reading {ship_skin_template_path}...")
with open(ship_skin_template_path, 'r', encoding='utf-8') as f:
    skin_templates = json.load(f)

kr_name_map = {}
for skin_id, skin_data in skin_templates.items():
    if 'name' in skin_data:
        kr_name_map[skin_id] = skin_data['name']

print(f"Loaded {len(kr_name_map)} Korean skin names.")

# ship_skin.json 로드 및 업데이트
print(f"Reading {ship_skin_path}...")
with open(ship_skin_path, 'r', encoding='utf-8') as f:
    ship_skins = json.load(f)

print("Updating ship_skin.json with name_kr field...")
updated_count = 0
for ship_gid, ship_data in ship_skins.items():
    if 'skins' in ship_data and isinstance(ship_data['skins'], dict):
        for skin_id, skin_info in ship_data['skins'].items():
            if skin_id in kr_name_map:
                skin_info['name_kr'] = kr_name_map[skin_id]
                updated_count += 1

# 업데이트된 ship_skin.json 저장
with open(ship_skin_path, 'w', encoding='utf-8') as f:
    json.dump(ship_skins, f, ensure_ascii=False, indent=2)

print(f"Successfully updated {updated_count} skins in {ship_skin_path}.")
print("Script finished.")
