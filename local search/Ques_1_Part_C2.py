import os
import random
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from Ques_1_Part_1 import get_neighbours, state_value


PLATEAU_LANDSCAPE = [4, 9, 6, 11, 15, 15, 15, 7, 13, 5, 16, 12]
GLOBAL_MAX_STATE = 11
SIDEWAYS_CAP = 10
REPRODUCIBLE_SEED = 1


def hill_climb_with_sideways(landscape, start, variant):
    state = start
    path = [state]
    sideways_moves = 0

    while True:
        current_value = state_value(landscape, state)
        uphill = []
        equal = []

        for neighbour in get_neighbours(landscape, state):
            neighbour_value = state_value(landscape, neighbour)
            if neighbour_value > current_value:
                uphill.append(neighbour)
            elif neighbour_value == current_value:
                equal.append(neighbour)

        if uphill:
            state = uphill[0] if variant == "first" else random.choice(uphill)
            path.append(state)
            continue

        if equal:
            print(
                f"Warning: plateau encountered at state {state} "
                f"(f={current_value}) with equal neighbour(s) {equal}."
            )
            if sideways_moves < SIDEWAYS_CAP:
                state = equal[0] if variant == "first" else random.choice(equal)
                path.append(state)
                sideways_moves += 1
                continue

        return path, state


def main():
    plateau_states = {5, 6, 7}
    before_fix = {"First-Choice HC": 5, "Stochastic HC": 5}
    after_fix = {"First-Choice HC": 0, "Stochastic HC": 0}
    success_after = {"First-Choice HC": 0, "Stochastic HC": 0}

    random.seed(REPRODUCIBLE_SEED)
    print(f"Q1(c) Sideways-move extension with cap = {SIDEWAYS_CAP}")
    print("-" * 97)
    print(
        f"{'Start':<7}{'Algorithm':<18}{'Path':<42}"
        f"{'Terminal State':<18}{'Steps':<6}"
    )
    print("-" * 97)

    for start in range(1, len(PLATEAU_LANDSCAPE) + 1):
        for name, variant in (
            ("First-Choice HC", "first"),
            ("Stochastic HC", "stochastic"),
        ):
            path, terminal = hill_climb_with_sideways(PLATEAU_LANDSCAPE, start, variant)
            if terminal in plateau_states:
                after_fix[name] += 1
            if terminal == GLOBAL_MAX_STATE:
                success_after[name] += 1
            print(
                f"{start:<7}{name:<18}{str(path):<42}"
                f"{terminal:<18}{len(path) - 1:<6}"
            )

    print("-" * 97)
    print(f"{'Algorithm':<18}{'Stuck Before':<15}{'Stuck After':<15}{'Reached 11':<12}")
    print("-" * 60)
    for algorithm in ("First-Choice HC", "Stochastic HC"):
        print(
            f"{algorithm:<18}{before_fix[algorithm]:<15}"
            f"{after_fix[algorithm]:<15}{success_after[algorithm]:<12}"
        )
    print("-" * 60)


if __name__ == "__main__":
    main()
