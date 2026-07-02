import { describe, expect, it } from "vitest";
import { scoreJourneyQuiz } from "../scoring";

const answer = (questionNumber: number, optionId: string) => ({
  questionId: `q${questionNumber}`,
  optionId
});

const answers = (options: string[]) =>
  options.map((optionId, index) => answer(index + 1, optionId));

describe("scoreJourneyQuiz", () => {
  it("adds points from selected options and returns the highest area", () => {
    const result = scoreJourneyQuiz(
      answers(["a", "a", "a", "a", "a", "a", "a", "a", "a", "a"])
    );

    expect(result.scores).toEqual({
      CD: 9,
      VP: 7,
      FL: 5,
      SR: 3,
      IP: 6
    });
    expect(result.resultKey).toBe("CD");
    expect(result.resultLabel).toBe("Clareza e Direcao");
  });

  it("rejects missing answers", () => {
    expect(() =>
      scoreJourneyQuiz(answers(["a", "a", "a", "a", "a", "a", "a", "a", "a"]))
    ).toThrow("exactly one answer for each question");
  });

  it("rejects duplicate question answers", () => {
    expect(() =>
      scoreJourneyQuiz([
        answer(1, "a"),
        answer(1, "b"),
        ...answers(["a", "a", "a", "a", "a", "a", "a", "a"]).map(
          (item, index) => ({ ...item, questionId: `q${index + 2}` })
        )
      ])
    ).toThrow("exactly one answer for each question");
  });

  it("prioritizes IP when tied and IP appears in a key question", () => {
    const result = scoreJourneyQuiz(
      answers(["a", "a", "a", "a", "a", "a", "a", "c", "b", "e"])
    );

    expect(result.scores).toMatchObject({ VP: 7, FL: 7, IP: 7 });
    expect(result.resultKey).toBe("IP");
  });

  it("prioritizes FL when tied and FL appears in a key question", () => {
    const result = scoreJourneyQuiz(
      answers(["a", "a", "a", "a", "a", "a", "a", "a", "c", "d"])
    );

    expect(result.scores).toMatchObject({ CD: 7, FL: 7 });
    expect(result.resultKey).toBe("FL");
  });

  it("prioritizes VP when tied and VP appears in a key question", () => {
    const result = scoreJourneyQuiz(
      answers(["a", "a", "a", "a", "a", "a", "a", "a", "c", "c"])
    );

    expect(result.scores).toMatchObject({ CD: 7, VP: 7 });
    expect(result.resultKey).toBe("VP");
  });

  it("prioritizes SR when tied and SR appears in a key question", () => {
    const result = scoreJourneyQuiz(
      answers(["a", "a", "a", "a", "a", "a", "d", "a", "c", "c"])
    );

    expect(result.scores).toMatchObject({ CD: 7, SR: 7 });
    expect(result.resultKey).toBe("SR");
  });

  it("uses final priority when no key-question tie breaker applies", () => {
    const result = scoreJourneyQuiz(
      answers(["e", "e", "d", "a", "d", "f", "f", "b", "d", "d"])
    );

    expect(result.scores).toMatchObject({ CD: 8, IP: 8 });
    expect(result.resultKey).toBe("IP");
  });
});
