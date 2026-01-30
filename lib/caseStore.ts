// PATH: lib/caseStore.ts

import { create } from "zustand";

type CaseState = {
  caseType: string;
  state: string;
  county: string;
  userName: string;
  otherPartyName: string;
  topic: string;
  facts: string;

  setCaseType: (v: string) => void;
  setState: (v: string) => void;
  setCounty: (v: string) => void;
  setUserName: (v: string) => void;
  setOtherPartyName: (v: string) => void;
  setTopic: (v: string) => void;
  setFacts: (v: string) => void;
};

export const useCaseStore = create<CaseState>((set) => ({
  caseType: "",
  state: "CA",
  county: "",
  userName: "",
  otherPartyName: "",
  topic: "",
  facts: "",

  setCaseType: (v) => set({ caseType: v }),
  setState: (v) => set({ state: v }),
  setCounty: (v) => set({ county: v }),
  setUserName: (v) => set({ userName: v }),
  setOtherPartyName: (v) => set({ otherPartyName: v }),
  setTopic: (v) => set({ topic: v }),
  setFacts: (v) => set({ facts: v }),
}));



