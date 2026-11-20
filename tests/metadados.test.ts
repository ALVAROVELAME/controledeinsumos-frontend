import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('compartilhamento e ícone', () => {
  it('usa o domínio e a imagem pública nas redes sociais', () => {
    const html = readFileSync('index.html', 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = (selector: string) => doc.querySelector(selector)?.getAttribute('content');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://ctinsumos.vercel.app/');
    expect(meta('meta[property="og:url"]')).toBe('https://ctinsumos.vercel.app/');
    expect(meta('meta[property="og:image"]')).toBe('https://ctinsumos.vercel.app/og-image.png');
    expect(meta('meta[name="twitter:image"]')).toBe(meta('meta[property="og:image"]'));
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/logo.svg');
    const imagem = readFileSync('public/og-image.png');
    expect(imagem.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(Number(meta('meta[property="og:image:width"]'))).toBe(imagem.readUInt32BE(16));
    expect(Number(meta('meta[property="og:image:height"]'))).toBe(imagem.readUInt32BE(20));
    expect(readFileSync('public/logo.svg', 'utf8')).toContain('<svg');
  });
});
