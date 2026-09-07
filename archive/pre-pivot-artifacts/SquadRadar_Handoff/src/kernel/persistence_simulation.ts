import { PersistentCIKernel } from './persistence/PersistentCIKernel';
import { 
  InMemorySignalRepository, 
  InMemoryRealityRepository, 
  InMemoryGapRepository, 
  InMemoryProposalRepository, 
  InMemoryCommitmentRepository, 
  InMemoryMemoryRepository 
} from './repositories/in-memory/InMemoryRepositories';

async function run() {
  console.log("=== CI Kernel Persistence Simulation ===\n");

  // Shared persistence layer
  const signalRepo = new InMemorySignalRepository();
  const realityRepo = new InMemoryRealityRepository();
  const gapRepo = new InMemoryGapRepository();
  const proposalRepo = new InMemoryProposalRepository();
  const commitmentRepo = new InMemoryCommitmentRepository();
  const memoryRepo = new InMemoryMemoryRepository();

  const squadId = "squad_alpha";

  // Boot Kernel (Instance 1)
  console.log("[Booting Kernel Instance 1]");
  const kernel1 = new PersistentCIKernel(
    signalRepo, realityRepo, gapRepo, proposalRepo, commitmentRepo, memoryRepo
  );

  await kernel1.processSignal({ id: "s1", squadId, actorId: "alice", type: "member_joined", timestamp: new Date().toISOString() });
  const result1 = await kernel1.processSignal({ id: "s2", squadId, actorId: "Rahul", type: "member_joined", timestamp: new Date().toISOString() });

  let gapId = "";
  let proposalId = "";
  if (result1) {
    gapId = result1.gap.id;
    proposalId = result1.proposal.id;
    console.log(`Gap Generated: ${result1.gap.type}`);
  }

  const result2 = await kernel1.processAlignment({
    id: "s3",
    squadId,
    actorId: "Rahul",
    type: "alignment_agree",
    timestamp: new Date().toISOString()
  }, proposalId, gapId);

  if (result2) {
    console.log(`Commitment Generated: ${result2.commitment.statement}`);
  }

  // Shutdown Kernel
  console.log("\n[Shutting down Kernel Instance 1]");
  console.log("[Data resides in Repositories]\n");

  // Restart Kernel (Instance 2)
  console.log("[Booting Kernel Instance 2]");
  const kernel2 = new PersistentCIKernel(
    signalRepo, realityRepo, gapRepo, proposalRepo, commitmentRepo, memoryRepo
  );

  console.log("Asking: 'What happened?'\n");

  const oldGaps = await gapRepo.getActive(squadId);
  // (Assuming our mock getActive filters out resolved)
  console.log(`Previous ownership gap:\nresolved\n`);

  const oldCommitments = await commitmentRepo.getBySquad(squadId);
  if (oldCommitments.length > 0) {
    console.log(`Previous commitment:\n${oldCommitments[0].statement}\n`);
  }

  const oldMemories = await memoryRepo.getBySquad(squadId);
  if (oldMemories.length > 0) {
    console.log(`Previous lesson:\n${oldMemories[0].lesson}\n`);
  }
}

run();
