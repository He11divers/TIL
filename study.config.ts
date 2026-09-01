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
    {
      name: "이동현",
      github: "Dong-H-LEE",
    },{
      name: "전병건",
      github: "wjsqudrjs77",
    },{
      name: "이상준",
      github: "LSJ0352",
    },{
      name: "이승종",
      github: "codingslave99",
    },
  ],
} satisfies {
  members: StudyMember[];
};