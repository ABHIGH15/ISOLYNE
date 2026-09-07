import { CIKernel } from './CIKernel';

function run() {
  console.log("=== CI Kernel v0.1 ===\n");
  const kernel = new CIKernel();

  // Actor 1 joins (No gap yet since size is 1)
  kernel.processSignal({
    id: "sig_1",
    squadId: "squad_1",
    actorId: "alex",
    type: "member_joined",
    timestamp: new Date().toISOString()
  });

  // Actor 2, 3, 4 join
  kernel.processSignal({ id: "sig_2", squadId: "squad_1", actorId: "sarah", type: "member_joined", timestamp: new Date().toISOString() });
  kernel.processSignal({ id: "sig_3", squadId: "squad_1", actorId: "michael", type: "member_joined", timestamp: new Date().toISOString() });

  console.log("Signal received:\nmember_joined\n");

  const result1 = kernel.processSignal({
    id: "sig_4",
    squadId: "squad_1",
    actorId: "Rahul", // Using Rahul to match the expected output exactly
    type: "member_joined",
    timestamp: new Date().toISOString()
  });

  if (result1) {
    console.log("Reality Projection:\n");
    console.log(`Members:\n${result1.state.members.length}`);
    console.log(`\nOwnership:\n${result1.state.ownership.ownerId || 'none'}\n`);

    console.log("Awareness Gap:\n");
    console.log(`${result1.gap.type}\n`);
    console.log(`"${result1.gap.hiddenReality}"\n`);

    console.log("Proposal:\n");
    console.log(`${result1.proposal.description}\n`);
  }

  console.log("---\n");
  console.log("Signal received:\n\nalignment_agree\n");

  const result2 = kernel.processAlignment({
    id: "sig_5",
    squadId: "squad_1",
    actorId: "Rahul",
    type: "alignment_agree",
    timestamp: new Date().toISOString()
  });

  if (result2) {
    console.log("Alignment:\n\ncomplete\n");
    
    console.log("Commitment:\n");
    console.log(`${result2.commitment.statement}\n`);

    console.log("Memory Saved:\n");
    console.log(`${result2.memory.lesson}`);
  }
}

run();
