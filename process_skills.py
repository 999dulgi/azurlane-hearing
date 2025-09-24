import json
import re

def process_skills():
    # Load the JSON files
    with open('public/name_code.json', 'r', encoding='utf-8') as f:
        name_code_data = json.load(f)

    with open('public/skill_data.json', 'r', encoding='utf-8') as f:
        skill_data = json.load(f)

    # Create a mapping from namecode id to name
    name_map = {key: value['name'] for key, value in name_code_data.items()}

    # 1. Process descriptions to replace {namecode:X}
    for skill_id, skill_info in skill_data.items():
        desc = skill_info.get('desc', '')
        matches = re.findall(r'{namecode:(\d+)}', desc)
        for code in matches:
            if code in name_map:
                desc = desc.replace(f'{{namecode:{code}}}', name_map[code])
        skill_info['desc'] = desc

    # 2. Group and merge "All Out Assault" skills
    skills_to_remove = set()
    processed_skills = {}
    
    # First, group skills by a common base name
    barrage_groups = {}
    for skill_id, skill_info in skill_data.items():
        name = skill_info.get('name', '')
        if '전탄발사' in name:
            # Normalize name for grouping, e.g., "전탄발사 - 세레스급I" -> "세레스급"
            # This handles cases like '전탄발사I', '전탄발사-나가라급I', '전탄발사 - 나가라 I'
            base_name = re.sub(r'전탄발사[\s-]*', '', name)
            base_name = re.sub(r'[\s-]*I[IV]*$', '', base_name).strip()
            
            if base_name not in barrage_groups:
                barrage_groups[base_name] = []
            barrage_groups[base_name].append(skill_info)

    # Now, process each group to find I/II pairs
    for base_name, skills in barrage_groups.items():
        skill1, skill2 = None, None
        for s in skills:
            name = s.get('name', '')
            if re.search(r'I[\s]*$', name) or re.search(r'I$', name):
                skill1 = s
            elif re.search(r'II[\s]*$', name) or re.search(r'II$', name):
                skill2 = s

        if skill1 and skill2:
            # Found a pair, now merge them
            match1 = re.search(r'(\d+)회', skill1.get('desc', ''))
            match2 = re.search(r'(\d+)회', skill2.get('desc', ''))

            if match1 and match2:
                count1 = match1.group(1)
                count2 = match2.group(1)

                new_name = re.sub(r'I[\s]*$', 'I/II', skill1['name']).strip()
                new_desc = f"주포로 {count1}/{count2}회 공격할때마다 특수 탄막 발사"
                
                # Use skill1's info as the base
                new_skill_id = str(skill1['id'])
                processed_skills[new_skill_id] = {
                    'id': skill1['id'],
                    'name': new_name,
                    'desc': new_desc,
                    'type': skill1.get('type'),
                    'max_level': 1,
                    'namecode': skill1.get('namecode')
                }
                
                # Mark both old skills for removal
                skills_to_remove.add(str(skill1['id']))
                skills_to_remove.add(str(skill2['id']))

    # Create the final dictionary
    final_skills = {}
    for skill_id, skill_info in skill_data.items():
        if skill_id not in skills_to_remove:
            final_skills[skill_id] = skill_info
            
    final_skills.update(processed_skills)

    # Save the modified data
    with open('public/skill_data_modified.json', 'w', encoding='utf-8') as f:
        json.dump(final_skills, f, ensure_ascii=False, indent=2)

    print("Skill data processing complete. Saved to public/skill_data_modified.json")

if __name__ == '__main__':
    process_skills()
