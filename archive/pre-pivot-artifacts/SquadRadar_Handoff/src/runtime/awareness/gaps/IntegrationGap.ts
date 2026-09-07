export type Assumption = {
  owner: string;
  belief: string;
};

export type IntegrationGap = {
  systemParts: string[];
  assumptions: Assumption[];
  missingSharedArtifact: string;
};
