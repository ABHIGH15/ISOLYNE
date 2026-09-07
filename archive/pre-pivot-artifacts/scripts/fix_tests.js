const fs = require('fs');
const file = 'src/kernel/tests/kernel.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'await kernel.processSignal({ id: "s1", squadId: "pipe1"',
  'await kernel.processSignal({ id: "j1", squadId: "pipe1", actorId: "Alice", type: "member_joined", timestamp: "T0" });\n      await kernel.processSignal({ id: "j2", squadId: "pipe1", actorId: "Bob", type: "member_joined", timestamp: "T0" });\n      await kernel.processSignal({ id: "s1", squadId: "pipe1"'
);

content = content.replace(
  'await kernel.processSignal({ id: "s1", squadId: "det1"',
  'await kernel.processSignal({ id: "j1", squadId: "det1", actorId: "Alice", type: "member_joined", timestamp: "T0" });\n      await kernel.processSignal({ id: "j2", squadId: "det1", actorId: "Bob", type: "member_joined", timestamp: "T0" });\n      await kernel.processSignal({ id: "s1", squadId: "det1"'
);

fs.writeFileSync(file, content);
