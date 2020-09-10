#!/usr/bin/env node
let clipboardy = require('clipboardy');
let codeRef = require('./main')

const BRIGHT = "\x1b[1m"
const YELLOW = "\x1b[93m"
const RESET = "\x1b[0m"

let args = process.argv.slice(2)
if (args.includes('-h') || args.includes('--help')) {
  console.info('Just run this script without any arguments to generate a unique code-ref')
} else {
  let ref = codeRef.generate()
  clipboardy.writeSync(ref)
  console.info(`${BRIGHT}Your generated code-ref: ${YELLOW}${ref}${RESET}`)
  console.info(`(copied to your clipboard)`)
}