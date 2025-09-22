/*
 Lightning Dashboard HTML contract tests
 Testing library/framework detected: agnostic (Jest/Vitest)

 These tests use Jest/Vitest-style globals (describe, it/test, expect) and perform pure string/regex validation
 so they run in both node/jsdom environments without extra dependencies.
 To point at a different HTML file, set: LIGHTNING_HTML=<path>
*/

const fs = require('fs');
const path = require('path');

const DEFAULT_HTML_PATH = process.env.LIGHTNING_HTML || path.resolve(process.cwd(), 'index.html');

function readHtml() {
  try {
    return fs.readFileSync(DEFAULT_HTML_PATH, 'utf8');
  } catch (err) {
    throw new Error('Could not read HTML at ' + DEFAULT_HTML_PATH + ': ' + err.message);
  }
}

const count = (re, s) => {
  const m = s.match(re);
  return m ? m.length : 0;
};

const findTags = (html, tagName) => {
  const re = new RegExp('<' + tagName + '\\b[^>]*>(?:[\\s\\S]*?)<\\/' + tagName + '>|<' + tagName + '\\b[^>]*\\/?>', 'gi');
  return html.match(re) || [];
};

describe('Lightning Dashboard document structure', () => {
  let html;
  beforeAll(() => {
    html = readHtml().replace(/\r\n/g, '\n');
  });

  test('has HTML5 doctype', () => {
    const trimmed = html.replace(/^\s+/, '');
    expect(/^<!doctype\s+html>/i.test(trimmed)).toBe(true);
  });

  test('sets lang="en" on <html>', () => {
    expect(/<html\b[^>]*\blang=["']?en["']?[^>]*>/i.test(html)).toBe(true);
  });

  test('has exactly one <title> with correct text', () => {
    const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(m => m[1].trim());
    expect(titles.length).toBe(1);
    expect(titles[0]).toBe('Lightning Dashboard');
  });

  test('includes charset UTF-8 meta', () => {
    expect(/<meta[^>]*charset=["']?utf-8["']?[^>]*>/i.test(html)).toBe(true);
  });

  test('includes responsive viewport meta', () => {
    expect(/<meta[^>]*name=["']viewport["'][^>]*content=["']\s*width=device-width,\s*initial-scale=1\.0\s*["'][^>]*>/i.test(html)).toBe(true);
  });

  test('links favicon as SVG at /vite.svg', () => {
    expect(/<link[^>]*rel=["']icon["'][^>]*type=["']image\/svg\+xml["'][^>]*href=["']\/vite\.svg["'][^>]*>/i.test(html)).toBe(true);
  });

  test('loads module JS with crossorigin and hashed filename under /assets', () => {
    const scripts = findTags(html, 'script');
    const main = scripts.find(t => /src=["']\/assets\/main-[A-Za-z0-9_-]{6,}\.js["']/i.test(t));
    expect(main).toBeDefined();
    expect(/type=["']module["']/i.test(main)).toBe(true);
    expect(/\bcrossorigin\b/i.test(main)).toBe(true);
    const content = (main.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i) || [])[1] || '';
    expect(content.trim()).toBe('');
  });

  test('links stylesheet with crossorigin and hashed filename under /assets', () => {
    const links = findTags(html, 'link');
    const css = links.find(t => /rel=["']stylesheet["']/i.test(t) && /href=["']\/assets\/main-[A-Za-z0-9_-]{6,}\.css["']/i.test(t));
    expect(css).toBeDefined();
    expect(/\bcrossorigin\b/i.test(css)).toBe(true);
  });

  test('contains a single empty #root container', () => {
    const idCount = count(/id=["']root["']/gi, html);
    expect(idCount).toBe(1);
    const m = html.match(/<div[^>]*id=["']root["'][^>]*>([\s\S]*?)<\/div>/i);
    expect(m).not.toBeNull();
    expect((m[1] || '').trim()).toBe('');
  });
});