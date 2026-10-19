"""카카오톡·문자 링크 미리보기 이미지(images/og.jpg)를 images/preview.jpeg 에서 만듭니다.

- 1200x630 으로 맞춰 자르며, 세로 사진은 위에서 35% 지점을 중심으로 자릅니다 (얼굴이 잘리지 않게).
- index.html 의 og:image 주소 끝 ?v= 값을 이미지 내용 해시로 바꿔 카카오톡 캐시를 우회합니다.

사용법: pip3 install pillow && python3 scripts/make_og.py
(GitHub 에 push 하면 .github/workflows/deploy.yml 이 자동으로 실행합니다)
"""
import hashlib
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images' / 'preview.jpeg'
OUT = ROOT / 'images' / 'og.jpg'
HTML = ROOT / 'index.html'
W, H, FOCUS = 1200, 630, 0.35


def main():
    if not SRC.exists():
        sys.exit(f'{SRC} 가 없습니다.')
    img = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')  # 휴대폰 사진 회전 보정
    r = max(W / img.width, H / img.height)
    img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    left = (img.width - W) // 2
    top = min(max(0, round(img.height * FOCUS - H / 2)), img.height - H)
    img.crop((left, top, left + W, top + H)).save(OUT, 'JPEG', quality=85, optimize=True, progressive=True)

    ver = hashlib.sha1(OUT.read_bytes()).hexdigest()[:8]
    html = HTML.read_text(encoding='utf-8')
    HTML.write_text(re.sub(r'images/og\.jpg(\?v=[^"]*)?"', f'images/og.jpg?v={ver}"', html), encoding='utf-8')
    print(f'og.jpg 생성 완료 ({W}x{H}, v={ver})')


if __name__ == '__main__':
    main()
