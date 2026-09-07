/**
 * HUMAN TRIAL v0.1 — Formation Protocol
 * 
 * Setup Scenario:
 * - 3 strangers
 * - 3 different technical backgrounds
 * - No assigned leader
 * 
 * Researcher Instruction:
 * "You are joining this team for a hackathon. This tool helps your team make important decisions."
 * (Say absolutely nothing else.)
 * 
 * Evaluation Criteria:
 * 1. Recognition: Did they understand the problem without reading carefully?
 * 2. Commitment: Did they press the button instinctively?
 * 3. Silence: Did they accept the 'resolved' state without asking "Now what?"
 */
export const formationTrialScript = {
  setup: {
    participantCount: 3,
    scenarioId: 'formation_no_leader',
  },
  researcherPrompt: "You are joining this team for a hackathon. This tool helps your team make important decisions.",
  expectedOutcome: "User taps 'I will take ownership' within 10 seconds and does not ask questions."
};
