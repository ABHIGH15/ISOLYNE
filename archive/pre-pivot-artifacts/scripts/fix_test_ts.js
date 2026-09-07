const fs = require('fs');
const file = 'src/kernel/tests/kernel.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ev\.proposal!\.options/g, 'ev.proposal!.options!');

fs.writeFileSync(file, content);
