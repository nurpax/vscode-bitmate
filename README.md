# vscode-bitmate

Bitmate displays the decimal/hex/binary value of literal number values in source code.  The supported hex/binary formats are:

- `$d020`, `0xd020`, `3dah` (hex)
- `%0101`, `0b0101`, `0101b` (binary)

Matching is case insensitive.

Bitmate decimal hover is turned on by default for the following file extensions: `*.asm`, `*.s`, `*.inc`.

![](images/bitmate-anim.gif)

## Contributing/Bug reporting

Please file bug reports via https://github.com/nurpax/vscode-bitmate

### 0.0.2 - 2019-06-25

- Add support for the following hex/binary syntaxes: `$d020`, `0xd020`, `3dah` (hex), `%0101`, `0b0101`, `0101b` (binary).  These are matched as case insensitive.
- Enable the hover feature only for the following file types: `*.asm`, `*.s`, `*.inc`

### 0.0.1 - 2019-06-22

Initial release

## Credits

Originally forked from https://github.com/thegtproject/vscode-hoverhex
