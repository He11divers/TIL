export type StudyMember = {
  name: string;
  github: string;
};

export const study = {
  members: [
    {
      name: "박정근",
      github: "r3j0",
    },
  ],
} satisfies {
  members: StudyMember[];
};