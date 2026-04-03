import os
import random
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from Ques_1_Part_1 import first_choice_hc, stochastic_hc


Q2_LANDSCAPE = [5, 8, 6, 12, 9, 7, 17, 14, 10, 6, 19, 15, 11, 8]
GLOBAL_MAX_STATE = 11
RRHC_RESTARTS = 20
REPRODUCIBLE_SEED = 7


def find_local_maxima(landscape):
    maxima = []
    for state in range(1, len(landscape) + 1):
        value = landscape[state - 1]
        left_value = landscape[state - 2] if state > 1 else None
        right_value = landscape[state] if state < len(landscape) else None
        if (left_value is None or value > left_value) and (
            right_value is None or value > right_value
        ):
            maxima.append(state)
    return maxima


def random_restart_hc(landscape, num_restarts, variant="first choice"):
    all_results = []
    best_state = None
    best_value = None

    for _ in range(num_restarts):
        start = random.randint(1, len(landscape))
        if variant == "first choice":
            path, terminal = first_choice_hc(landscape, start)
        else:
            path, terminal = stochastic_hc(landscape, start)
        value = landscape[terminal - 1]
        all_results.append((start, terminal, path))
        if best_value is None or value > best_value:
            best_state = terminal
            best_value = value

    return best_state, best_value, all_results


def main():
    random.seed(REPRODUCIBLE_SEED)
    print("Q2(a) Local maxima:", find_local_maxima(Q2_LANDSCAPE))
    print()

    for variant in ("first choice", "stochastic"):
        best_state, best_value, all_results = random_restart_hc(
            Q2_LANDSCAPE, RRHC_RESTARTS, variant=variant
        )
        print(f"Q2(a) RRHC using {variant}")
        print("-" * 74)
        print(
            f"{'Restart':<10}{'Start':<8}{'Terminal':<10}"
            f"{'f-value':<10}{'Global Max Found':<18}"
        )
        print("-" * 74)
        for index, (start, terminal, path) in enumerate(all_results, start=1):
            value = Q2_LANDSCAPE[terminal - 1]
            label = "Yes" if terminal == GLOBAL_MAX_STATE else "No"
            print(f"{index:<10}{start:<8}{terminal:<10}{value:<10}{label:<18}")
            print(f"{'':<18}Path: {path}")
        print("-" * 74)
        print(f"Best state: {best_state}, best value: {best_value}")
        print()


if __name__ == "__main__":
    main()
