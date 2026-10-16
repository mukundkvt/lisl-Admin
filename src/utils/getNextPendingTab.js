import { STAGE_ORDER } from "@/constants/stageOrder";

export const getNextPendingTab = (statusResponse) => {
  for (const stage of STAGE_ORDER) {
    if (statusResponse[stage.key] === "pending") {
      return stage.tab;
    }
  }
  return null; // all approved
};
