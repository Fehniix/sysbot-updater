#!/usr/bin/env node

import meow from "meow";

const cli = meow(`
Usage
  $ foo <input>

Options
  --rainbow, -r  Include a rainbow

Examples
  $ foo unicorns --rainbow
  🌈 unicorns 🌈
`, {
	importMeta: import.meta,
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
});

console.log(cli.input, cli.flags);