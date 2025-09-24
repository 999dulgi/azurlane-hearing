import json

# 입력 및 출력 파일 경로 설정
TEMPLATE_FILE = 'public/ship_data_template.json'
SHIPS_KR_FILE = 'public/ship_kr.json'
OUTPUT_FILE = 'public/ship_kr_updated.json' # 원본을 덮어쓰지 않고 새 파일에 저장

def merge_oil_cost():
    """
    ship_data_template.json에서 oil_at_end와 oil_at_start 데이터를 
    ship_kr.json으로 병합하여 새로운 파일에 저장합니다.
    """
    try:
        # JSON 파일 로드
        with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
            template_data = json.load(f)
        with open(SHIPS_KR_FILE, 'r', encoding='utf-8') as f:
            ships_kr_data = json.load(f)

    except FileNotFoundError as e:
        print(f"오류: 파일을 찾을 수 없습니다 - {e.filename}")
        return
    except json.JSONDecodeError as e:
        print(f"오류: JSON 파일 파싱에 실패했습니다: {e}")
        return

    updated_ships = []
    merged_count = 0

    # ship_kr.json의 각 함선에 대해 데이터 병합
    for ship in ships_kr_data:
        ship_id_str = str(ship.get('sid')[-1]) # template 파일의 키는 문자열

        if ship_id_str in template_data:
            template_entry = template_data[ship_id_str]
            
            # oil_at_end와 oil_at_start 값이 있는지 확인하고 추가
            if 'oil_at_end' in template_entry:
                ship['oilMax'] = template_entry['oil_at_end']
            if 'oil_at_start' in template_entry:
                ship['oilMin'] = template_entry['oil_at_start']
            
            merged_count += 1
        
        updated_ships.append(ship)

    # 변경된 데이터로 새로운 JSON 파일 저장
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(updated_ships, f, ensure_ascii=False, indent=2)

    print(f"작업 완료. 총 {merged_count}척의 함선에 연료 소모량 데이터가 병합되었습니다.")
    print(f"결과가 '{OUTPUT_FILE}' 파일에 저장되었습니다.")

if __name__ == '__main__':
    merge_oil_cost()
