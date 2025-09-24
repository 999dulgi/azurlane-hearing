import json

def filter_skills():
    # 필요한 스킬 ID 목록 로드
    with open('public/skill_icon.json', 'r', encoding='utf-8') as f:
        skill_icons = json.load(f)
    required_skill_ids = set(skill_icons.keys())

    # 원본 스킬 데이터 로드
    with open('public/skill_data_template.json', 'r', encoding='utf-8') as f:
        all_skills = json.load(f)

    # 필요한 스킬만 필터링
    filtered_skills = {
        skill_id: skill_data
        for skill_id, skill_data in all_skills.items()
        if skill_id in required_skill_ids
    }

    for filtered_skill in filtered_skills.values():
        if "$1" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$1", f"({filtered_skill["desc_add"][0][0][0]} ~ {filtered_skill["desc_add"][0][-1][0]})")
        if "$2" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$2", f"({filtered_skill["desc_add"][1][0][0]} ~ {filtered_skill["desc_add"][1][-1][0]})")
        if "$3" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$3", f"({filtered_skill["desc_add"][2][0][0]} ~ {filtered_skill["desc_add"][2][-1][0]})")
        if "$4" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$4", f"({filtered_skill["desc_add"][3][0][0]} ~ {filtered_skill["desc_add"][3][-1][0]})")
        if "$5" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$5", f"({filtered_skill["desc_add"][4][0][0]} ~ {filtered_skill["desc_add"][4][-1][0]})")
        if "$6" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$6", f"({filtered_skill["desc_add"][5][0][0]} ~ {filtered_skill["desc_add"][5][-1][0]})")
        if "$7" in filtered_skill["desc"]:
            filtered_skill["desc"] = filtered_skill["desc"].replace("$7", f"({filtered_skill["desc_add"][6][0][0]} ~ {filtered_skill["desc_add"][6][-1][0]})")
        
        del filtered_skill["desc_add"]
        del filtered_skill["desc_get_add"]
        del filtered_skill["desc_get"]
        del filtered_skill["system_transform"]
        del filtered_skill["world_death_mark"]

    # 필터링된 데이터를 새 파일에 저장
    with open('public/skill_data.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_skills, f, ensure_ascii=False, indent=2)

    print(f"필터링 완료! 총 {len(filtered_skills)}개의 스킬이 'public/skill_data.json'에 저장되었습니다.")

if __name__ == "__main__":
    filter_skills()
