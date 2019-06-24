'use strict';
import * as vscode from 'vscode';

function formatBinDecHex(hoveredWord: string, v: number, mask: number): vscode.Hover {
  const bin = `%${v.toString(2).padStart(8, '0')}`;
  const dec = `${v.toString()}`;
  const hex = `$${v.toString(16).padStart(2, '0').toUpperCase()}`;
  const strs = [bin, dec, hex];
  const outStrs = [];
  for (let i = 0; i < 3; i++) {
    if ((mask & (1 << i)) !== 0) {
      outStrs.push(strs[i]);
    }
  }
  return new vscode.Hover(hoveredWord + ' = ' + `${outStrs.join(' / ')}`);
}

const hexDollar = '(?:\\$(?<dollar>[0-9a-f]+))';
const hexh = '(?:(?<h>[0-9a-f]+)h)';
const hex0x = '(?:0x(?<zerox>[0-9a-f]+))';
const hexRe = new RegExp(`^(?:${hexDollar}|${hexh}|${hex0x})$`, 'i');

const binPerc = '(?:%(?<perc>[0-1]+))';
const binb = '(?:(?<b>[0-1]+)b)';
const bin0b = '(?:0b(?<zerob>[0-1]+))';
const binRe = new RegExp(`^(?:${binPerc}|${binb}|${bin0b})$`, 'i');

export function activate(context: vscode.ExtensionContext) {
  const defaultLangs: vscode.DocumentFilter[] = [
    { 'scheme': 'file', 'pattern': '**/*.asm' },
    { 'scheme': 'file', 'pattern': '**/*.s' },
    { 'scheme': 'file', 'pattern': '**/*.inc' },
  ];
  let aa = vscode.languages.registerHoverProvider(defaultLangs, {
    provideHover(document, position, token) {
      // Note: depending on what language mode you use, $1234 might be split
      // to two words '$' and '1234' or one word '$1234'.  The latter
      // is the "correct" word split but f.ex. at the time of writing,
      // c64jasm (and I'm sure others) don't split words correctly.
      //
      // So this code matches but the normal word split (primarily) and
      // if there's no match, dilates the selection by one char at the
      // beginning of the word.
      const wp = document.getWordRangeAtPosition(position)!;
      const start = wp.start;
      const dilated = wp!.with(start.with(start.line, start.character - 1));
      let hoveredWord = document.getText(dilated);
      if (hoveredWord.length > 0) {
        if ((hoveredWord[0] != '$') && (hoveredWord[0] != '%')) {
          hoveredWord = hoveredWord.slice(1);
        }
      }

      const hexMatch = hexRe.exec(hoveredWord);
      if (hexMatch) {
        const groups = (hexMatch as any).groups;
        const hex = groups.dollar || groups.h || groups.zerox;
        const x = parseInt(hex, 16);
        if (!isNaN(x)) {
          return formatBinDecHex(hoveredWord, x, 0b011);
        }
      }

      const binaryMatch = binRe.exec(hoveredWord);
      if (binaryMatch) {
        const groups = (binaryMatch as any).groups;
        const bin = groups.perc || groups.b || groups.zerob;
        const x = parseInt(bin, 2);
        if (!isNaN(x)) {
          return formatBinDecHex(hoveredWord, x, 0b110);
        }
      }

      // Decimal case, match the non-dilated word range
      const w = document.getText(wp);
      if (/^[0-9]+$/g.test(w)) {
        const x = parseInt(w, 10);
        if (!isNaN(x)) {
          return formatBinDecHex(w, x, 0b101);
        }
      }

    }
  });
  context.subscriptions.push(aa);
}

export function deactivate() {
}