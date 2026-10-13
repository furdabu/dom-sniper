const SHADOW_BOUNDARY = ' >>> ';

/**
 * 要素までの CSS セレクタを組み立てる。
 * 階層は `>` で繋ぎ、同じセレクタに一致する兄弟がいるときだけ `:nth-child()` を付けるので、
 * そのまま querySelector に渡せる。Shadow DOM の境界は CSS では越えられないため ` >>> ` で区切る。
 */
export function getDomPath(target: Element): string {
  const doc = target.ownerDocument;
  const scopes: string[] = [];
  let segments: string[] = [];
  let outermost = target;

  for (let el: Element | null = target; el; ) {
    const isRoot = el === doc.documentElement || el === doc.body;
    if (isRoot && el !== target) break;

    segments.unshift(getSegment(el));
    outermost = el;
    if (isRoot) break;

    const parent: ParentNode | null = el.parentNode;
    if (parent instanceof ShadowRoot) {
      scopes.unshift(segments.join(' > '));
      segments = [];
      el = parent.host;
    } else {
      el = el.parentElement;
    }
  }

  let light = segments.join(' > ');
  // body を省いたせいで別の場所にも一致してしまう場合だけ、body から書き始める
  if (outermost.parentElement === doc.body && !isUnique(doc, light)) {
    light = `body > ${light}`;
  }
  return [light, ...scopes].join(SHADOW_BOUNDARY);
}

/** 表示用の短い名前。セレクタとしてのエスケープはしない */
export function getLabel(el: Element): string {
  if (el.id) return `${el.localName}#${el.id}`;
  return el.localName + [...el.classList].map((name) => `.${name}`).join('');
}

function getSegment(el: Element): string {
  const tag = CSS.escape(el.localName);
  const base = el.id
    ? `${tag}#${CSS.escape(el.id)}`
    : tag + [...el.classList].map((name) => `.${CSS.escape(name)}`).join('');

  const siblings = [...(el.parentNode?.children ?? [])];
  const ambiguous = siblings.some((sibling) => sibling !== el && sibling.matches(base));
  return ambiguous ? `${base}:nth-child(${siblings.indexOf(el) + 1})` : base;
}

function isUnique(doc: Document, selector: string): boolean {
  return doc.querySelectorAll(selector).length === 1;
}
