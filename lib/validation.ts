import { z } from "zod";

const setSchema = z
  .object({
    playerOneGames: z.number().int().min(0).max(7),
    playerTwoGames: z.number().int().min(0).max(7)
  })
  .refine((set) => set.playerOneGames !== set.playerTwoGames, {
    message: "A tennis set cannot end in a tie."
  });

export const createMatchSchema = z
  .object({
    playerOneId: z.string().min(1),
    playerTwoId: z.string().min(1),
    playedAt: z.string().date(),
    status: z.enum(["completed", "incomplete", "canceled"]),
    matchType: z.literal("singles"),
    winnerId: z.string().min(1),
    createdByUserId: z.string().min(1),
    notes: z.string().optional(),
    sets: z.array(setSchema).min(2).max(3)
  })
  .superRefine((input, ctx) => {
    if (input.playerOneId === input.playerTwoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Players must be different.",
        path: ["playerTwoId"]
      });
    }

    if (![input.playerOneId, input.playerTwoId].includes(input.winnerId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Winner must be one of the selected players.",
        path: ["winnerId"]
      });
    }

    if (input.status === "completed") {
      const setWins = input.sets.reduce(
        (total, set) => {
          if (set.playerOneGames > set.playerTwoGames) {
            total.playerOne += 1;
          } else {
            total.playerTwo += 1;
          }
          return total;
        },
        { playerOne: 0, playerTwo: 0 }
      );

      const expectedWinnerId =
        setWins.playerOne > setWins.playerTwo ? input.playerOneId : input.playerTwoId;

      if (expectedWinnerId !== input.winnerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Winner does not match the submitted set scores.",
          path: ["winnerId"]
        });
      }
    }
  });
