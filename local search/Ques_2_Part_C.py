import os
import random
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from Ques_2_Part_A import GLOBAL_MAX_STATE, random_restart_hc


Q2_PLATEAU_LANDSCAPE = [5, 8, 6, 12, 9, 7, 17, 17, 10, 6, 19, 15, 11, 8]
RRHC_RESTARTS = 20


def random_restart_hc_with_plateau_counter(landscape, num_restarts):
    best_state = None
    best_value = None
    plateau_counter = 0

    for _ in range(num_restarts):
        start = random.randint(1, len(landscape))
        _, terminal, path = _single_restart(landscape, start)
        value = landscape[terminal - 1]
        if terminal in (7, 8):
            plateau_counter += 1
        if best_value is None or value > best_value:
            best_state = terminal
            best_value = value

    return best_state, best_value, plateau_counter


def _single_restart(landscape, start):
    path = [start]
    state = start
    while True:
        current_value = landscape[state - 1]
        uphill = []
        if state > 1 and landscape[state - 2] > current_value:
            uphill.append(state - 1)
        if state < len(landscape) and landscape[state] > current_value:
            uphill.append(state + 1)
        if not uphill:
            return start, state, path
        state = uphill[0]
        path.append(state)


def main():
    random.seed()
    trials = 100
    original_success = 0
    plateau_success = 0
    plateau_hits = 0

    original_landscape = [5, 8, 6, 12, 9, 7, 17, 14, 10, 6, 19, 15, 11, 8]

    for _ in range(trials):
        best_state, _, _ = random_restart_hc(original_landscape, RRHC_RESTARTS, "first choice")
        if best_state == GLOBAL_MAX_STATE:
            original_success += 1

    for _ in range(trials):
        best_state, _, plateau_counter = random_restart_hc_with_plateau_counter(
            Q2_PLATEAU_LANDSCAPE, RRHC_RESTARTS
        )
        if best_state == GLOBAL_MAX_STATE:
            plateau_success += 1
        plateau_hits += plateau_counter

    print("Q2(c) Plateau comparison")
    print("-" * 72)
    print(
        f"{'Landscape':<28}{'Global Max Discovery Rate':<28}"
        f"{'Avg Plateau Restarts':<16}"
    )
    print("-" * 72)
    print(f"{'Original landscape':<28}{(original_success / trials):.4f}{'':<23}{0.00:.2f}")
    print(
        f"{'Plateau at states 7 and 8':<28}{(plateau_success / trials):.4f}"
        f"{'':<23}{(plateau_hits / trials):.2f}"
    )
    print("-" * 72)


if __name__ == "__main__":
    main()
