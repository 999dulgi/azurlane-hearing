import json
import os

def clean_ship_data():
    """
    'public/ship_kr.json' 파일을 읽어 'tech' 필드가 있는 모든 항목에서
    'id', 'maxstar', 'tech.class' 필드를 제거하고,
    결과를 다시 같은 파일에 저장합니다.
    """
    file_path = os.path.join('public', 'ship_kr.json')

    try:
        # 파일을 읽고 JSON 데이터를 로드합니다.
        with open(file_path, 'r', encoding='utf-8') as f:
            ships = json.load(f)

        # 'tech' 필드가 있는 항목을 찾아 필드를 제거합니다.
        for ship in ships:
            if 'tech' in ship and isinstance(ship['tech'], dict):
                # 'id' 필드 제거
                if 'id' in ship['tech']:
                    del ship['tech']['id']
                
                # 'maxstar' 필드 제거
                if 'max_star' in ship['tech']:
                    del ship['tech']['max_star']
                
                # 'tech' 객체 내의 'class' 필드 제거
                if 'class' in ship['tech']:
                    del ship['tech']['class']

        # 수정된 데이터를 다시 파일에 예쁘게 포맷하여 저장합니다.
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(ships, f, ensure_ascii=False, indent=2)

        print(f"'{file_path}' 파일 처리가 완료되었습니다.")
        print("'tech'를 포함하는 모든 항목에서 'id', 'maxstar', 'tech.class' 필드가 제거되었습니다.")

    except FileNotFoundError:
        print(f"오류: '{file_path}' 파일을 찾을 수 없습니다.")
    except json.JSONDecodeError:
        print(f"오류: '{file_path}' 파일이 올바른 JSON 형식이 아닙니다.")
    except Exception as e:
        print(f"알 수 없는 오류가 발생했습니다: {e}")

if __name__ == '__main__':
    clean_ship_data()