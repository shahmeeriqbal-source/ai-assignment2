import random
import os
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from Ques_1_Part_1 import get_neighbours, state_value


PLATEAU_LANDSCAPE = [4, 9, 6, 11, 15, 15, 15, 7, 13, 5, 16, 12]


def first_choice_hc_plateau(landscape, start):
    state = start
    path = [state]

    while True:
        current_value = state_value(landscape, state)
        neighbours = get_neighbours(landscape, state)
        uphill = []
        equal = []

        for neighbour in neighbours:
            neighbour_value = state_value(landscape, neighbour)
            if neighbour_value > current_value:
                uphill.append(neighbour)
            elif neighbour_value == current_value:
                equal.append(neighbour)

        if uphill:
            state = random.choice(uphill)
            path.append(state)
            continue

        if equal:
            print(
                f"Warning: plateau encountered at state {state} "
                f"(f={current_value}) with equal neighbour(s) {equal}."
            )
        return path, state


def stochastic_hc_plateau(landscape, start):
    state = start
    path = [state]

    while True:
        current_value = state_value(landscape, state)
        neighbours = get_neighbours(landscape, state)
        uphill = []
        equal = []

        for neighbour in neighbours:
            neighbour_value = state_value(landscape, neighbour)
            if neighbour_value > current_value:
                uphill.append(neighbour)
            elif neighbour_value == current_value:
                equal.append(neighbour)

        if uphill:
            state = uphill[0]
            path.append(state)
            continue

        if equal:
            print(
                f"Warning: plateau encountered at state {state} "
                f"(f={current_value}) with equal neighbour(s) {equal}."
            )
        return path, state


def main():
    plateau_states = {5, 6, 7}
    first_choice_stuck = 0
    stochastic_stuck = 0

    print("Q1(c) Plateau detection without sideways moves")
    print("-" * 97)
    print(
        f"{'Start':<7}{'Algorithm':<18}{'Path':<42}"
        f"{'Terminal State':<18}{'Steps':<6}"
    )
    print("-" * 97)

    for start in range(1, len(PLATEAU_LANDSCAPE) + 1):
        for name, algorithm in (
            ("First-Choice HC", first_choice_hc_plateau),
            ("Stochastic HC", stochastic_hc_plateau),
        ):
            path, terminal = algorithm(PLATEAU_LANDSCAPE, start)
            if name == "First-Choice HC" and terminal in plateau_states:
                first_choice_stuck += 1
            if name == "Stochastic HC" and terminal in plateau_states:
                stochastic_stuck += 1
            print(
                f"{start:<7}{name:<18}{str(path):<42}"
                f"{terminal:<18}{len(path) - 1:<6}"
            )

    print("-" * 97)
    print(f"First-Choice runs stuck on plateau: {first_choice_stuck}")
    print(f"Stochastic runs stuck on plateau: {stochastic_stuck}")


if __name__ == "__main__":
    main()
