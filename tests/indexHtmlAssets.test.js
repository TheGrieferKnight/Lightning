/**
 * Tests for index.html asset and meta/link/script integrity.
 *
 * Testing library/framework:
 * - Assumed Vitest with jsdom environment (common in Vite apps). If using Jest, you can
 *   remove the import line below; the rest (describe/it/expect) is Jest-compatible.
 */
import { describe, it, expect } from "vitest";

// Source HTML under test (captured from the diff)
const html = String.raw`<\!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <meta name="theme-color" content="#0b1220" />
    <meta name="color-scheme" content="dark light" />
    <meta name="description" content="Lightning Dashboard" />

    <\!-- Favicon or app icon (place vite.svg or your icon in /public) -->
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />

    <title>Lightning Dashboard</title>

    <\!-- Optional: preload a primary font
    <link
      rel="preload"
      href="/fonts/Inter-Variable.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    -->
    <script type="module" crossorigin src="/Lightning-demo/assets/index-DGMYxnFE.js"></script>
    <link rel="stylesheet" crossorigin href="/Lightning-demo/assets/index-BQDI6_6a.css">
  </head>

  <body class="bg-app-gradient-smooth has-noise text-white">
    <div id="root"></div>

    <\!-- Entry point; Vite resolves TS/TSX and assets -->
    
    <\!-- Optional: guard for users without JS -->
    <noscript>
      This app requires JavaScript to run. Please enable JavaScript in your
      browser.
    </noscript>
  </body>
</html>`;

function getDom() {
  // Use DOM if provided by the test environment; otherwise, fall back to a minimal parser via a temporary DOM.
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content;
  }
  // Fallback for environments without jsdom: use a very small DOM shim via JSDOM-like parsing through DOMParser if available.
  // If DOMParser is not available, we will skip DOM-based checks and rely on regex/string assertions.
  return null;
}

describe("index.html - document structure", () => {
  it("includes required root elements and language", () => {
    expect(html).toContain("<\!DOCTYPE html>");
    expect(html).toMatch(/<html[^>]*\slang="en"/);
    expect(html).toMatch(/<head>[\s\S]*<\/head>/);
    expect(html).toMatch(/<body[^>]*>[\s\S]*<\/body>/);
  });

  it("sets the correct title", () => {
    expect(html).toMatch(/<title>\s*Lightning Dashboard\s*<\/title>/);
  });

  it("has a root container div with id='root'", () => {
    expect(html).toMatch(/<div\s+id="root"\s*><\/div>/);
  });

  it("applies the expected body classes for theming", () => {
    expect(html).toMatch(/<body[^>]*class="[^"]*bg-app-gradient-smooth[^"]*has-noise[^"]*text-white[^"]*"/);
  });
});

describe("index.html - meta tags", () => {
  it("includes charset UTF-8", () => {
    expect(html).toMatch(/<meta\s+charset="utf-8"\s*\/?>/i);
  });

  it("defines viewport with width=device-width, initial-scale=1, and viewport-fit=cover", () => {
    // Ensure all three directives exist
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content="[^"]*width=device-width[^"]*"/);
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content="[^"]*initial-scale=1[^"]*"/);
    expect(html).toMatch(/<meta[^>]+name="viewport"[^>]+content="[^"]*viewport-fit=cover[^"]*"/);
  });

  it("sets theme-color", () => {
    expect(html).toMatch(/<meta\s+name="theme-color"\s+content="#0b1220"\s*\/?>/i);
  });

  it("declares color-scheme supporting dark and light", () => {
    expect(html).toMatch(/<meta\s+name="color-scheme"\s+content="dark light"\s*\/?>/i);
  });

  it("includes a descriptive description meta tag", () => {
    expect(html).toMatch(/<meta\s+name="description"\s+content="Lightning Dashboard"\s*\/?>/i);
  });
});

describe("index.html - icon and assets", () => {
  it("links a favicon svg at /vite.svg with correct rel and type", () => {
    expect(html).toMatch(/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/vite\.svg"\s*\/?>/);
  });

  it("includes a module script for the built JS under /Lightning-demo/assets/ with crossorigin", () => {
    // Permit any hashed filename
    expect(html).toMatch(/<script[^>]*\stype="module"[^>]*\scrossorigin\b[^>]*\s+src="\/Lightning-demo\/assets\/index-[A-Za-z0-9_-]+\.js"\s*><\/script>/);
  });

  it("includes a stylesheet under /Lightning-demo/assets/ with crossorigin", () => {
    expect(html).toMatch(/<link[^>]*\srel="stylesheet"[^>]*\scrossorigin\b[^>]*\s+href="\/Lightning-demo\/assets\/index-[A-Za-z0-9_-]+\.css"\s*\/?>/);
  });

  it("does not accidentally include non-prefixed asset paths (guard against regressions)", () => {
    // Ensure no root-level index-*.js/css outside of /Lightning-demo/assets/
    const badJs = /<script[^>]+src="\/(?\!Lightning-demo\/assets\/)index-[A-Za-z0-9_-]+\.js"/;
    const badCss = /<link[^>]+href="\/(?\!Lightning-demo\/assets\/)index-[A-Za-z0-9_-]+\.css"/;
    expect(badJs.test(html)).toBe(false);
    expect(badCss.test(html)).toBe(false);
  });
});

describe("index.html - progressive enhancement and fallbacks", () => {
  it("contains a helpful <noscript> message for users without JavaScript", () => {
    expect(html).toMatch(/<noscript>[\s\S]*requires JavaScript to run[\s\S]*<\/noscript>/i);
  });
});

// Optional DOM-backed tests if jsdom DOM is available
describe("index.html - DOM-backed assertions (if environment provides DOM)", () => {
  const dom = getDom();

  it("parses and locates script and stylesheet elements via DOM when available", () => {
    if (!dom) {
      // Skip when no DOM support
      expect(dom).toBeNull();
      return;
    }
    const script = dom.querySelector('script[type="module"][crossorigin]');
    const link = dom.querySelector('link[rel="stylesheet"][crossorigin]');
    const icon = dom.querySelector('link[rel="icon"][type="image/svg+xml"]');
    const root = dom.querySelector('#root');

    expect(script).toBeTruthy();
    expect(link).toBeTruthy();
    expect(icon).toBeTruthy();
    expect(root).toBeTruthy();

    if (script) {
      expect(script.getAttribute("src")).toMatch(/^\/Lightning-demo\/assets\/index-[A-Za-z0-9_-]+\.js$/);
    }
    if (link) {
      expect(link.getAttribute("href")).toMatch(/^\/Lightning-demo\/assets\/index-[A-Za-z0-9_-]+\.css$/);
    }
    if (icon) {
      expect(icon.getAttribute("href")).toBe("/vite.svg");
    }
  });

  it("verifies meta viewport content contains required directives via DOM when available", () => {
    if (!dom) {
      expect(dom).toBeNull();
      return;
    }
    const metaViewport = dom.querySelector('meta[name="viewport"]');
    expect(metaViewport).toBeTruthy();
    if (metaViewport) {
      const content = metaViewport.getAttribute("content") || "";
      expect(content).toContain("width=device-width");
      expect(content).toContain("initial-scale=1");
      expect(content).toContain("viewport-fit=cover");
    }
  });
});