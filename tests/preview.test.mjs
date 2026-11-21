import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getFirstTilImage } from '../src/lib/til/preview.ts';
import { parseTilMarkdown } from '../src/lib/til/parser.ts';
const preview = content => getFirstTilImage(content, 'member', '주제/글.md');

test('uses the first real image in document order, including linked and nested images', () => {
  assert.deepEqual(preview('> [![첫 그림](../images/first.png)](https://example.com)\n\n![다음](second.png)'), {src:'/til-assets/member/images/first.png',alt:'첫 그림'});
});

test('resolves full, collapsed, and shortcut references even when definitions follow them', () => {
  for (const body of ['![설명][My Image]', '![My Image][]', '![My Image]']) {
    assert.equal(preview(`${body}\n\n[my image]: ../images/ref.webp`).src, '/til-assets/member/images/ref.webp');
  }
  assert.equal(preview('![x][id]\n\n[id]: a.png\n[id]: b.png').src,'/til-assets/member/주제/a.png'.replace('주제',encodeURIComponent('주제')));
});

test('ignores image syntax in fenced, inline and indented code, HTML, escaped text and math', () => {
  const content = '```md\n![code](code.png)\n```\n\n`![inline](inline.png)`\n\n    ![indented](indent.png)\n\n<img src="html.png">\n\n\\![escaped](escaped.png)\n\n$$\n![math](math.png)\n$$\n\n![real](real.png)';
  assert.equal(preview(content).src, '/til-assets/member/%EC%A3%BC%EC%A0%9C/real.png');
});

test('encodes spaces, Korean and parentheses in relative paths and preserves external URL queries', () => {
  assert.equal(preview('![x](<../images/한글 (1).png>)').src, '/til-assets/member/images/%ED%95%9C%EA%B8%80%20(1).png');
  assert.equal(preview('![x](https://example.com/image?id=1#x)').src, 'https://example.com/image?id=1#x');
  assert.equal(preview('![x](/images/public.svg)').src,'/images/public.svg');
});

test('omits previews for text-only and example-only posts, unresolved or unsafe images', () => {
  for (const content of ['', '# 글\n본문', '```md\n![example](example.png)\n```', '![missing][id]', '![x](javascript:alert)', '![x](data:image/png;base64,abc)', '![x](../../../other/private.png)', '![x](../images/file.txt)']) {
    assert.equal(preview(content), undefined, content);
  }
});

test('uses real first-image metadata for existing TILs while excluding sample code', async () => {
  const source = await readFile('raw/Dong-H-LEE/C_SW/1주차.md','utf8');
  const image = getFirstTilImage(parseTilMarkdown(source).content, 'Dong-H-LEE', 'C_SW/1주차.md');
  assert.equal(image.src,'/til-assets/Dong-H-LEE/images/20261022_c_sw_week1_01.png');
  const bytes = await readFile('raw/Dong-H-LEE/images/20261022_c_sw_week1_01.png');
  assert.ok(bytes.length > 0);
  const sample = parseTilMarkdown(await readFile('raw/r3j0/sample.md','utf8')).content;
  assert.equal(getFirstTilImage(sample,'r3j0','sample.md'), undefined);
});
