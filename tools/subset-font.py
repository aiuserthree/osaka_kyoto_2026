#!/usr/bin/env python3
"""
Pretendard 서브셋 재생성.

assets/fonts/Pretendard-subset.woff2 는 이 사이트에 실제로 쓰인 글자만
남긴 파일이다(2MB -> 110KB). 페이지에 새로운 글자를 추가했는데 그 글자만
다른 서체로 보인다면 이 스크립트를 다시 돌리면 된다.

    python3 -m venv .venv
    .venv/bin/pip install fonttools brotli
    .venv/bin/python tools/subset-font.py

원본 폰트는 자동으로 내려받는다(jsDelivr, 약 2MB).
Pretendard © orioncactus — SIL Open Font License 1.1
"""
import glob
import io
import os
import re
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_URL = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2'
SRC = os.path.join(ROOT, 'tools', '.PretendardVariable.woff2')
DST = os.path.join(ROOT, 'assets', 'fonts', 'Pretendard-subset.woff2')

# 라틴·문장부호·화살표는 넉넉히 잡아둔다. 한글/CJK 는 실제 쓰인 글자만.
RANGES = ','.join([
    'U+0020-007E', 'U+00A0-00FF',          # 기본 라틴
    'U+2010-2027', 'U+2030-205E',          # 문장부호
    'U+20A9', 'U+20AC',                    # ₩ €
    'U+2190-21FF',                         # 화살표
    'U+25A0-25FF',                         # 도형 (▸ 등)
    'U+2660-266F',
])


def used_characters():
    chars = set()
    for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        html = io.open(path, encoding='utf-8').read()
        html = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html, flags=re.S)
        chars |= set(re.sub(r'<[^>]+>', ' ', html))
    return {c for c in chars if ord(c) > 31}


def main():
    try:
        subprocess.run(['pyftsubset', '--help'], capture_output=True, check=True)
        pyftsubset = 'pyftsubset'
    except (FileNotFoundError, subprocess.CalledProcessError):
        pyftsubset = os.path.join(os.path.dirname(sys.executable), 'pyftsubset')
        if not os.path.exists(pyftsubset):
            sys.exit('pyftsubset 을 찾지 못했습니다. `pip install fonttools brotli` 후 다시 실행하세요.')

    if not os.path.exists(SRC):
        print('원본 폰트 내려받는 중...', SRC_URL)
        urllib.request.urlretrieve(SRC_URL, SRC)

    chars = used_characters()
    cjk = sorted(c for c in chars if 0x3000 <= ord(c) <= 0x9FFF)
    print('고유 글자 %d자 (CJK: %s)' % (len(chars), ''.join(cjk)))

    unicodes = RANGES + ''.join(',U+%04X' % ord(c) for c in cjk)
    os.makedirs(os.path.dirname(DST), exist_ok=True)
    subprocess.run([
        pyftsubset, SRC,
        '--output-file=' + DST,
        '--flavor=woff2',
        '--layout-features=*',      # tnum(고정폭 숫자) 유지
        '--no-hinting',
        '--desubroutinize',
        '--name-IDs=*', '--name-legacy', '--name-languages=*',
        '--unicodes=' + unicodes,
        '--text=' + ''.join(sorted(chars)),
    ], check=True)

    print('%s  %.1f KB (원본 %.1f KB)' % (
        os.path.relpath(DST, ROOT),
        os.path.getsize(DST) / 1024,
        os.path.getsize(SRC) / 1024))


if __name__ == '__main__':
    main()
