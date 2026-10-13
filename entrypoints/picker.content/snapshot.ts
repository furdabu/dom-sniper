import type { ElementSnapshot } from '@/lib/types';
import { getDomPath, getLabel } from './dom-path';

const MAX_HTML = 20_000;
const MAX_TEXT = 2_000;
const MAX_SNIPPET_TEXT = 200;
const MAX_ATTRIBUTE = 200;

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

export function takeSnapshot(el: Element): ElementSnapshot {
  const { top, left, width, height } = el.getBoundingClientRect();
  const text = collapseWhitespace(el instanceof HTMLElement ? el.innerText : (el.textContent ?? ''));
  const html = el.outerHTML;

  return {
    url: location.href,
    title: document.title,
    label: getLabel(el),
    domPath: getDomPath(el),
    rect: { top, left, width, height },
    snippet: getSnippet(el, text),
    html:
      html.length > MAX_HTML
        ? `${html.slice(0, MAX_HTML)}\n<!-- truncated (${html.length} characters in total) -->`
        : html,
    text: truncate(text, MAX_TEXT),
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}

/**
 * 開始タグとテキストだけの 1 行表現。
 * cloneNode だと <img> の再読み込みなどの副作用があるため、属性から文字列を組み立てる。
 */
function getSnippet(el: Element, text: string): string {
  const attributes = [...el.attributes]
    .map(({ name, value }) => ` ${name}="${escapeAttribute(truncate(value, MAX_ATTRIBUTE))}"`)
    .join('');
  const open = `<${el.localName}${attributes}>`;
  if (VOID_ELEMENTS.has(el.localName)) return open;
  return `${open}${escapeText(truncate(text, MAX_SNIPPET_TEXT))}</${el.localName}>`;
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
