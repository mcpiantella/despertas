import {
  EMPTY_SCORES,
  JOURNEY_AREAS,
  JOURNEY_RESULT_LABELS,
  type JourneyArea,
  QUIZ_QUESTIONS,
  type ScoreMap
} from "./quiz-data";

export type JourneyAnswer = {
  questionId: string;
  optionId: string;
};

export type ScoringResult = {
  resultKey: JourneyArea;
  resultLabel: string;
  scores: ScoreMap;
};

const KEY_QUESTIONS: Partial<Record<JourneyArea, string[]>> = {
  IP: ["q8", "q9", "q10"],
  FL: ["q4", "q6", "q9"],
  VP: ["q3", "q5", "q6", "q7"],
  SR: ["q2", "q3", "q6", "q9"]
};

const KEY_TIE_PRIORITY: JourneyArea[] = ["IP", "FL", "VP", "SR"];
const FINAL_TIE_PRIORITY: JourneyArea[] = ["IP", "FL", "VP", "SR", "CD"];

export function scoreJourneyQuiz(answers: JourneyAnswer[]): ScoringResult {
  const answersByQuestion = new Map(answers.map((item) => [item.questionId, item]));

  if (answers.length !== QUIZ_QUESTIONS.length || answersByQuestion.size !== QUIZ_QUESTIONS.length) {
    throw new Error("Quiz must include exactly one answer for each question.");
  }

  const scores = { ...EMPTY_SCORES };
  const scoredAreasByQuestion = new Map<string, Set<JourneyArea>>();

  for (const question of QUIZ_QUESTIONS) {
    const selected = answersByQuestion.get(question.id);
    const option = question.options.find((item) => item.id === selected?.optionId);

    if (!option) {
      throw new Error("Quiz must include exactly one answer for each question.");
    }

    scoredAreasByQuestion.set(question.id, new Set(Object.keys(option.scores) as JourneyArea[]));

    for (const area of JOURNEY_AREAS) {
      scores[area] += option.scores[area] ?? 0;
    }
  }

  const resultKey = resolveResultKey(scores, scoredAreasByQuestion);

  return {
    resultKey,
    resultLabel: JOURNEY_RESULT_LABELS[resultKey],
    scores
  };
}

function resolveResultKey(
  scores: ScoreMap,
  scoredAreasByQuestion: Map<string, Set<JourneyArea>>
): JourneyArea {
  const highestScore = Math.max(...JOURNEY_AREAS.map((area) => scores[area]));
  const tiedAreas = JOURNEY_AREAS.filter((area) => scores[area] === highestScore);

  if (tiedAreas.length === 1) {
    return tiedAreas[0];
  }

  for (const area of KEY_TIE_PRIORITY) {
    if (!tiedAreas.includes(area)) {
      continue;
    }

    const keyQuestions = KEY_QUESTIONS[area] ?? [];
    const scoredOnKeyQuestion = keyQuestions.some((questionId) =>
      scoredAreasByQuestion.get(questionId)?.has(area)
    );

    if (scoredOnKeyQuestion) {
      return area;
    }
  }

  return FINAL_TIE_PRIORITY.find((area) => tiedAreas.includes(area)) ?? tiedAreas[0];
}
