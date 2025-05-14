
export type ExampleWord = {
  word: string;
  type: string;
  pronunciation: string;
};

export type ExampleDefinition = {
  definition: string;
  tblword?: ExampleWord;
};

export type Example = {
  exampleid: number;
  english: string;
  persian: string;
  definitionid: number;
  tbldefinition?: ExampleDefinition;
};

export type PracticeItem = {
  id: number;
  exampleid: number;
  score: number;
  tblexample: Example;
};

export type Difficulty = "100" | "1000" | "3000" | "5000" | "10000";
