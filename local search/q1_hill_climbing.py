import random


Q1_LANDSCAPE = [4, 9, 6, 11, 8, 15, 10, 7, 13, 5, 16, 12]
PLATEAU_LANDSCAPE = [4, 9, 6, 11, 15, 15, 15, 7, 13, 5, 16, 12]
GLOBAL_MAX_STATE = 11
SIDEWAYS_CAP = 10
REPRODUCIBLE_SEED = 1


def state_value(landscape, state):
    return landscape[state - 1]


def get_neighbours(landscape, state):
    neighbours = []
    if state > 1:
        neighbours.append(state - 1)
    if state < len(landscape):
        neighbours.append(state + 1)
    return neighbours


def first_choice_hc(landscape, start):
    return _hill_climb(
        landscape,
        start,
        variant="first_choice",
        allow_sideways=False,
        warn_on_plateau=False,
    )


def stochastic_hc(landscape, start):
    return _hill_climb(
        landscape,
        start,
        variant="stochastic",
        allow_sideways=False,
        warn_on_plateau=False,
    )


def first_choice_hc_plateau(landscape, start, allow_sideways=False, sideways_cap=0):
    return _hill_climb(
        landscape,
        start,
        variant="first_choice",
        allow_sideways=allow_sideways,
        sideways_cap=sideways_cap,
        warn_on_plateau=True,
    )


def stochastic_hc_plateau(landscape, start, allow_sideways=False, sideways_cap=0):
    return _hill_climb(
        landscape,
        start,
        variant="stochastic",
        allow_sideways=allow_sideways,
        sideways_cap=sideways_cap,
        warn_on_plateau=True,
    )


def _hill_climb(
    landscape,
    start,
    variant,
    allow_sideways,
    sideways_cap=0,
    warn_on_plateau=False,
):
    state = start
    path = [state]
    sideways_moves = 0

    while True:
        current_value = state_value(landscape, state)
        neighbours = get_neighbours(landscape, state)

        uphill = []
        equal = []
        ordered_neighbours = neighbours[:]

        for neighbour in ordered_neighbours:
            neighbour_value = state_value(landscape, neighbour)
            if neighbour_value > current_value:
                uphill.append(neighbour)
            elif neighbour_value == current_value:
                equal.append(neighbour)

        if variant == "first_choice":
            if uphill:
                next_state = uphill[0]
                state = next_state
                path.append(state)
                continue
            if equal:
                if warn_on_plateau:
                    print(
                        f"Warning: plateau encountered at state {state} "
                        f"(f={current_value}) with equal neighbour(s) {equal}."
                    )
                if allow_sideways and sideways_moves < sideways_cap:
                    state = equal[0]
                    path.append(state)
                    sideways_moves += 1
                    continue
            return path, state

        if uphill:
            state = random.choice(uphill)
            path.append(state)
            continue

        if equal:
            if warn_on_plateau:
                print(
                    f"Warning: plateau encountered at state {state} "
                    f"(f={current_value}) with equal neighbour(s) {equal}."
                )
            if allow_sideways and sideways_moves < sideways_cap:
                state = random.choice(equal)
                path.append(state)
                sideways_moves += 1
                continue

        return path, state


def run_all_starts(landscape, algorithms):
    results = []
    for start in range(1, len(landscape) + 1):
        for name, func in algorithms:
            path, terminal = func(landscape, start)
            results.append(
                {
                    "start": start,
                    "algorithm": name,
                    "path": path,
                    "terminal": terminal,
                    "steps": len(path) - 1,
                }
            )
    return results


def print_results_table(results, title):
    print(title)
    print("-" * 97)
    print(
        f"{'Start':<7}{'Algorithm':<18}{'Path':<42}"
        f"{'Terminal State':<18}{'Steps':<6}"
    )
    print("-" * 97)
    for row in results:
        print(
            f"{row['start']:<7}{row['algorithm']:<18}{str(row['path']):<42}"
            f"{row['terminal']:<18}{row['steps']:<6}"
        )
    print("-" * 97)
    print()


def print_global_max_summary(results, title):
    counts = {}
    for row in results:
        counts.setdefault(row["algorithm"], 0)
        if row["terminal"] == GLOBAL_MAX_STATE:
            counts[row["algorithm"]] += 1

    print(title)
    print("-" * 38)
    print(f"{'Algorithm':<18}{'Starts Reaching 11':<20}")
    print("-" * 38)
    for algorithm, count in counts.items():
        print(f"{algorithm:<18}{count:<20}")
    print("-" * 38)
    print()


def find_differences(results):
    first_choice = {}
    stochastic = {}

    for row in results:
        if row["algorithm"] == "First-Choice HC":
            first_choice[row["start"]] = row
        else:
            stochastic[row["start"]] = row

    different = []
    for start in sorted(first_choice):
        if first_choice[start]["terminal"] != stochastic[start]["terminal"]:
            different.append((first_choice[start], stochastic[start]))
    return different


def print_divergence_report(results, landscape):
    differences = find_differences(results)

    print("Starting states where the terminal states differ")
    print("-" * 92)
    if not differences:
        print("None")
        print("-" * 92)
        print()
        return

    for first_choice, stochastic in differences:
        start = first_choice["start"]
        left = start - 1 if start > 1 else None
        right = start + 1 if start < len(landscape) else None
        current = state_value(landscape, start)
        left_value = state_value(landscape, left) if left else None
        right_value = state_value(landscape, right) if right else None

        print(
            f"Start {start}: First-Choice -> state {first_choice['terminal']} via {first_choice['path']}; "
            f"Stochastic -> state {stochastic['terminal']} via {stochastic['path']}."
        )
        print(
            f"  f({start})={current}, left neighbour f({left})={left_value}, "
            f"right neighbour f({right})={right_value}."
        )
        if start == 5:
            print(
                "  Both neighbours are uphill. First-Choice takes the left improvement immediately "
                "to state 4, while Stochastic can randomly choose the higher right branch to state 6."
            )
        elif start == 8:
            print(
                "  Both neighbours are uphill. First-Choice always checks left first and goes toward "
                "state 6, but Stochastic may instead choose the right branch and terminate at state 9."
            )
        elif start == 10:
            print(
                "  Both neighbours are uphill. First-Choice commits to the left move and gets trapped "
                "at local maximum state 9, while Stochastic can choose the right move and reach state 11."
            )
        print()


def run_stochastic_trials_from_four(landscape, trials=50):
    random.seed()
    hits_global_max = 0
    hits_other_local_max = 0
    terminal_counts = {}

    for _ in range(trials):
        _, terminal = stochastic_hc(landscape, 4)
        terminal_counts[terminal] = terminal_counts.get(terminal, 0) + 1
        if terminal == GLOBAL_MAX_STATE:
            hits_global_max += 1
        else:
            hits_other_local_max += 1

    global_percentage = (hits_global_max / trials) * 100
    local_percentage = (hits_other_local_max / trials) * 100

    print("Stochastic HC repeated 50 times from s = 4")
    print("-" * 58)
    print(f"Reached state 11: {hits_global_max} times ({global_percentage:.2f}%)")
    print(
        f"Reached a local maximum other than 11: {hits_other_local_max} times "
        f"({local_percentage:.2f}%)"
    )
    print(f"Terminal-state counts: {terminal_counts}")
    print("-" * 58)
    print()


def count_plateau_stuck(results, plateau_states):
    counts = {}
    for row in results:
        counts.setdefault(row["algorithm"], 0)
        if row["terminal"] in plateau_states:
            counts[row["algorithm"]] += 1
    return counts


def print_plateau_summary(no_sideways_results, with_sideways_results):
    plateau_states = {5, 6, 7}
    before_counts = count_plateau_stuck(no_sideways_results, plateau_states)
    after_counts = count_plateau_stuck(with_sideways_results, plateau_states)

    print("Plateau summary for states {5, 6, 7}")
    print("-" * 72)
    print(
        f"{'Algorithm':<18}{'Stuck Before Fix':<20}"
        f"{'Stuck After Fix':<18}{'State 11 After Fix':<16}"
    )
    print("-" * 72)

    success_after = {}
    for row in with_sideways_results:
        success_after.setdefault(row["algorithm"], 0)
        if row["terminal"] == GLOBAL_MAX_STATE:
            success_after[row["algorithm"]] += 1

    for algorithm in before_counts:
        print(
            f"{algorithm:<18}{before_counts[algorithm]:<20}"
            f"{after_counts.get(algorithm, 0):<18}{success_after.get(algorithm, 0):<16}"
        )
    print("-" * 72)
    print()


def print_sideways_paths(landscape):
    algorithms = [
        (
            "First-Choice HC",
            lambda ls, start: first_choice_hc_plateau(
                ls, start, allow_sideways=True, sideways_cap=SIDEWAYS_CAP
            ),
        ),
        (
            "Stochastic HC",
            lambda ls, start: stochastic_hc_plateau(
                ls, start, allow_sideways=True, sideways_cap=SIDEWAYS_CAP
            ),
        ),
    ]
    results = run_all_starts(landscape, algorithms)
    print_results_table(
        results,
        f"Q1(c) Results with sideways moves allowed (cap = {SIDEWAYS_CAP})",
    )
    return results


def main():
    print("Q1 landscape:", Q1_LANDSCAPE)
    print("Global maximum state:", GLOBAL_MAX_STATE)
    print()

    # Keep the all-start table reproducible so the report can include a stable output.
    random.seed(REPRODUCIBLE_SEED)
    base_algorithms = [
        ("First-Choice HC", first_choice_hc),
        ("Stochastic HC", stochastic_hc),
    ]
    base_results = run_all_starts(Q1_LANDSCAPE, base_algorithms)
    print_results_table(base_results, "Q1(a) Results from all starting states")
    print_global_max_summary(base_results, "Q1(b) Summary: starts reaching the global maximum")
    print_divergence_report(base_results, Q1_LANDSCAPE)

    # This experiment must use true randomness, so the seed is intentionally reset.
    run_stochastic_trials_from_four(Q1_LANDSCAPE, trials=50)

    print("Plateau-modified landscape:", PLATEAU_LANDSCAPE)
    print()

    random.seed(REPRODUCIBLE_SEED)
    plateau_algorithms = [
        (
            "First-Choice HC",
            lambda ls, start: first_choice_hc_plateau(ls, start, allow_sideways=False),
        ),
        (
            "Stochastic HC",
            lambda ls, start: stochastic_hc_plateau(ls, start, allow_sideways=False),
        ),
    ]
    plateau_results = run_all_starts(PLATEAU_LANDSCAPE, plateau_algorithms)
    print_results_table(
        plateau_results,
        "Q1(c) Results on the plateau landscape without sideways moves",
    )

    random.seed(REPRODUCIBLE_SEED)
    sideways_results = print_sideways_paths(PLATEAU_LANDSCAPE)
    print_plateau_summary(plateau_results, sideways_results)


if __name__ == "__main__":
    main()
