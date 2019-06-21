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

export function activate(context: vscode.ExtensionContext) {
  let aa = vscode.languages.registerHoverProvider({scheme: '*', language: '*'}, {
    provideHover(document, position, token) {
      // Note: the language mode doesn't interpret $1234 as a word '$1234' but
      // splits it to '$' and '1234'.  So we hack a little a merge
      // the range to contain '$' if that's present right before the hovered
      // word.
      const wp = document.getWordRangeAtPosition(position)!;
      const start = wp.start;
      const dilated = wp!.with(start.with(start.line, start.character - 1));
      const hoveredWord = document.getText(dilated);
      const hexMatch = /^\$([0-9a-fA-F]+)$/g.exec(hoveredWord);
      if (hexMatch) {
        const x = parseInt(hexMatch[1], 16);
        if (!isNaN(x)) {
          return formatBinDecHex(hoveredWord, x, 0b011);
        }
      }

      const binaryMatch = /^%([0-9a-fA-F]+)$/g.exec(hoveredWord);
      if (binaryMatch) {
        const x = parseInt(binaryMatch[1], 2);
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