import os
import random
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from Ques_2_Part_A import GLOBAL_MAX_STATE, Q2_LANDSCAPE, random_restart_hc


RESTART_COUNTS = [1, 3, 5, 10, 20]
TRIALS_PER_N = 100


def estimate_success_probability(num_restarts):
    success_count = 0
    for _ in range(TRIALS_PER_N):
        best_state, _, _ = random_restart_hc(Q2_LANDSCAPE, num_restarts, "first choice")
        if best_state == GLOBAL_MAX_STATE:
            success_count += 1
    return success_count / TRIALS_PER_N


def main():
    random.seed()
    empirical = {}

    print("Q2(b) Empirical probability table")
    print("-" * 50)
    print(f"{'Restarts (n)':<15}{'Empirical Probability':<22}")
    print("-" * 50)
    for n in RESTART_COUNTS:
        empirical[n] = estimate_success_probability(n)
        print(f"{n:<15}{empirical[n]:.4f}")
    print("-" * 50)
    print()

    p = 2 / 12
    print("Q2(b) Theoretical probability table")
    print("p = 2/12 = 1/6 = 0.1667")
    print("-" * 58)
    print(f"{'Restarts (n)':<15}{'1 - (1 - p)^n':<20}{'Value':<12}")
    print("-" * 58)
    for n in RESTART_COUNTS:
        theoretical = 1 - (1 - p) ** n
        print(f"{n:<15}{'1 - (5/6)^' + str(n):<20}{theoretical:.4f}")
    print("-" * 58)


if __name__ == "__main__":
    main()
