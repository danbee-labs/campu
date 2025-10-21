import json, random
from pathlib import Path

random.seed(2025)

cities = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시",
    "경기도", "강원특별자치도", "충청북도", "충청남도",
    "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
]

# 시군/면 이름 후보
districts = [
    "사천시", "양양군", "속초시", "고성군", "춘천시", "제주시",
    "청주시", "아산시", "논산시", "순천시", "포항시", "통영시",
    "김해시", "거제시", "남해군", "밀양시", "하동군", "홍천군", "강릉시"
]

towns = [
    "서포면", "죽변면", "토평면", "성산읍", "안면읍", "고북면", "진잠동",
    "삼천동", "용현동", "연산면", "대흥동", "중앙동", "신창면",
    "대청동", "미사동", "풍암동", "금남면", "노형동"
]

road_roots = [
    "토끼", "사슴", "자작나무", "하늘", "솔향", "모닥불", "해안", "별빛",
    "달빛", "한라", "무궁화", "한강", "금강", "백두", "소나무", "들꽃",
    "은하", "노을", "바람", "봄꽃", "초원", "하모니", "청춘", "호수",
]

suffixes = ["로", "길", "대로", "고개로", "해안로"]

addresses = set()
records = []
target = 500000

def make_address():
    city = random.choice(cities)
    dist = random.choice(districts)
    town = random.choice(towns)
    road = random.choice(road_roots) + random.choice(suffixes)
    num1, num2 = random.randint(1, 999), random.randint(1, 99)
    return f"{city} {dist} {town} {road} {num1}-{num2}"

while len(addresses) < target:
    addr = make_address()
    if addr not in addresses:
        addresses.add(addr)
        name = f"{addr.split()[2]} 캠핑장 {len(addresses)}"
        records.append({"address": addr, "name": name})

out_path = Path("camping_random_50k.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"✅ 생성 완료: {out_path} ({len(records)}건)")