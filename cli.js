#!/usr/bin/env node
import clipboardy from 'clipboardy';
import * as codeRef from './main.js';

const BRIGHT = '\x1b[1m';
const YELLOW = '\x1b[93m';
const RESET = '\x1b[0m';

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) {
  console.info('Just run this script without any arguments to generate a unique code-ref');
} else {
  const ref = codeRef.generate();
  clipboardy.writeSync(ref);
  console.info(`${BRIGHT}Your generated code-ref: ${YELLOW}${ref}${RESET}`);
  console.info('(copied to your clipboard)');
}
