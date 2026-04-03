import random


Q1_LANDSCAPE = [4, 9, 6, 11, 8, 15, 10, 7, 13, 5, 16, 12]
GLOBAL_MAX_STATE = 11
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
    state = start
    path = [state]

    while True:
        current_value = state_value(landscape, state)
        moved = False
        for neighbour in get_neighbours(landscape, state):
            if state_value(landscape, neighbour) > current_value:
                state = neighbour
                path.append(state)
                moved = True
                break
        if not moved:
            return path, state


def stochastic_hc(landscape, start):
    state = start
    path = [state]

    while True:
        current_value = state_value(landscape, state)
        uphill = []
        for neighbour in get_neighbours(landscape, state):
            if state_value(landscape, neighbour) > current_value:
                uphill.append(neighbour)
        if not uphill:
            return path, state
        state = random.choice(uphill)
        path.append(state)


def run_all_starts(landscape):
    results = []
    algorithms = [
        ("First-Choice HC", first_choice_hc),
        ("Stochastic HC", stochastic_hc),
    ]
    for start in range(1, len(landscape) + 1):
        for name, algorithm in algorithms:
            path, terminal = algorithm(landscape, start)
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


def print_results_table(results):
    print("Q1(a) Results from all starting states")
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


def print_global_max_summary(results):
    counts = {"First-Choice HC": 0, "Stochastic HC": 0}
    for row in results:
        if row["terminal"] == GLOBAL_MAX_STATE:
            counts[row["algorithm"]] += 1

    print("Q1(b) Summary table for state 11")
    print("-" * 38)
    print(f"{'Algorithm':<18}{'Starts Reaching 11':<20}")
    print("-" * 38)
    for algorithm, count in counts.items():
        print(f"{algorithm:<18}{count:<20}")
    print("-" * 38)
    print()


def print_divergence_report(results):
    grouped = {}
    for row in results:
        grouped.setdefault(row["start"], {})[row["algorithm"]] = row

    print("Q1(b) Starting states with different terminal states")
    print("-" * 92)
    for start in sorted(grouped):
        first_choice = grouped[start]["First-Choice HC"]
        stochastic = grouped[start]["Stochastic HC"]
        if first_choice["terminal"] == stochastic["terminal"]:
            continue

        left = start - 1
        right = start + 1
        print(
            f"Start {start}: First-Choice -> {first_choice['terminal']} via {first_choice['path']}; "
            f"Stochastic -> {stochastic['terminal']} via {stochastic['path']}"
        )
        print(
            f"  f({start})={state_value(Q1_LANDSCAPE, start)}, "
            f"f({left})={state_value(Q1_LANDSCAPE, left)}, "
            f"f({right})={state_value(Q1_LANDSCAPE, right)}"
        )
    print("-" * 92)
    print()


def run_stochastic_trials_from_four(trials=50):
    random.seed()
    terminal_counts = {}
    hits_global = 0

    for _ in range(trials):
        _, terminal = stochastic_hc(Q1_LANDSCAPE, 4)
        terminal_counts[terminal] = terminal_counts.get(terminal, 0) + 1
        if terminal == GLOBAL_MAX_STATE:
            hits_global += 1

    hits_local = trials - hits_global
    print("Q1(b) Stochastic HC repeated 50 times from s = 4")
    print("-" * 58)
    print(f"Reached state 11: {hits_global} times ({(hits_global / trials) * 100:.2f}%)")
    print(
        f"Reached a local maximum other than 11: {hits_local} times "
        f"({(hits_local / trials) * 100:.2f}%)"
    )
    print(f"Terminal-state counts: {terminal_counts}")
    print("-" * 58)
    print()


def main():
    print("Q1 landscape:", Q1_LANDSCAPE)
    print("Global maximum state:", GLOBAL_MAX_STATE)
    print()

    random.seed(REPRODUCIBLE_SEED)
    results = run_all_starts(Q1_LANDSCAPE)
    print_results_table(results)
    print_global_max_summary(results)
    print_divergence_report(results)
    run_stochastic_trials_from_four()


if __name__ == "__main__":
    main()
