export interface Formula {
  name: string;
  expr: string;
  desc: string;
  category: "Algebra" | "Calculus" | "Geometry" | "Trigonometry" | "Physics" | "Statistics" | "General";
  youtubeQuery: string;
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
}

export interface SolveResult {
  problem: string;
  solved: boolean;
  steps: string[];
  finalAnswer: string;
  conceptsExplained: ConceptExplanation[];
  youtubeQueries: string[];
}

export interface WorkedExample {
  problem: string;
  solutionSteps: string[];
  answer: string;
}

export interface DeepFormulaExplanation {
  formulaName: string;
  expression: string;
  description: string;
  historyAndContext: string;
  proofOrDerivation: string;
  realWorldApplications: string[];
  workedExample: WorkedExample;
  youtubeQueries: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  quizTitle: string;
  topic: string;
  questions: QuizQuestion[];
}
