import os
import random
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from q1_hill_climbing import first_choice_hc, stochastic_hc


Q2_LANDSCAPE = [5, 8, 6, 12, 9, 7, 17, 14, 10, 6, 19, 15, 11, 8]
Q2_PLATEAU_LANDSCAPE = [5, 8, 6, 12, 9, 7, 17, 17, 10, 6, 19, 15, 11, 8]
GLOBAL_MAX_STATE = 11
RRHC_RESTARTS = 20
TRIALS_PER_N = 100
RESTART_COUNTS = [1, 3, 5, 10, 20]
REPRODUCIBLE_SEED = 7


def find_local_maxima(landscape):
    maxima = []
    for state in range(1, len(landscape) + 1):
        value = landscape[state - 1]
        left_value = landscape[state - 2] if state > 1 else None
        right_value = landscape[state] if state < len(landscape) else None

        left_ok = left_value is None or value > left_value
        right_ok = right_value is None or value > right_value
        if left_ok and right_ok:
            maxima.append(state)
    return maxima


def run_variant(landscape, start, variant):
    if variant == "first choice":
        return first_choice_hc(landscape, start)
    if variant == "stochastic":
        return stochastic_hc(landscape, start)
    raise ValueError("variant must be 'first choice' or 'stochastic'")


def random_restart_hc(landscape, num_restarts, variant="first choice"):
    best_state = None
    best_value = None
    all_results = []

    for _ in range(num_restarts):
        start = random.randint(1, len(landscape))
        path, terminal = run_variant(landscape, start, variant)
        value = landscape[terminal - 1]
        all_results.append((start, terminal, path))

        if best_value is None or value > best_value:
            best_state = terminal
            best_value = value

    return best_state, best_value, all_results


def random_restart_hc_with_plateau_counter(landscape, num_restarts, variant="first choice"):
    best_state = None
    best_value = None
    all_results = []
    plateau_terminations = 0

    for _ in range(num_restarts):
        start = random.randint(1, len(landscape))
        path, terminal = run_variant(landscape, start, variant)
        value = landscape[terminal - 1]
        all_results.append((start, terminal, path))

        if terminal in (7, 8):
            plateau_terminations += 1

        if best_value is None or value > best_value:
            best_state = terminal
            best_value = value

    return best_state, best_value, all_results, plateau_terminations


def print_restart_table(title, landscape, all_results):
    print(title)
    print("-" * 74)
    print(
        f"{'Restart':<10}{'Start':<8}{'Terminal':<10}"
        f"{'f-value':<10}{'Global Max Found':<18}"
    )
    print("-" * 74)
    for index, (start, terminal, path) in enumerate(all_results, start=1):
        value = landscape[terminal - 1]
        is_global = "Yes" if terminal == GLOBAL_MAX_STATE else "No"
        print(f"{index:<10}{start:<8}{terminal:<10}{value:<10}{is_global:<18}")
        print(f"{'':<18}Path: {path}")
    print("-" * 74)
    print()


def estimate_success_probability(landscape, variant, num_restarts, trials):
    success_count = 0
    for _ in range(trials):
        best_state, _, _ = random_restart_hc(landscape, num_restarts, variant=variant)
        if best_state == GLOBAL_MAX_STATE:
            success_count += 1
    return success_count / trials


def print_empirical_probability_table(landscape):
    print("Q2(b) Empirical probability of finding state 11 under RRHC")
    print("-" * 50)
    print(f"{'Restarts (n)':<15}{'Empirical Probability':<22}")
    print("-" * 50)
    empirical = {}
    for n in RESTART_COUNTS:
        probability = estimate_success_probability(
            landscape,
            variant="first choice",
            num_restarts=n,
            trials=TRIALS_PER_N,
        )
        empirical[n] = probability
        print(f"{n:<15}{probability:.4f}")
    print("-" * 50)
    print()
    return empirical


def print_theoretical_probability_table():
    p = 2 / 12
    print("Q2(b) Theoretical probability using p from Q1 First-Choice HC")
    print("p = 2/12 = 1/6 = 0.1667")
    print("-" * 58)
    print(f"{'Restarts (n)':<15}{'1 - (1 - p)^n':<20}{'Value':<12}")
    print("-" * 58)
    theoretical = {}
    for n in RESTART_COUNTS:
        value = 1 - (1 - p) ** n
        theoretical[n] = value
        print(f"{n:<15}{'1 - (5/6)^' + str(n):<20}{value:.4f}")
    print("-" * 58)
    print()
    return theoretical


def compare_plateau_discovery_rates():
    trials = 100
    results = []
    for label, landscape in (
        ("Original landscape", Q2_LANDSCAPE),
        ("Plateau at states 7 and 8", Q2_PLATEAU_LANDSCAPE),
    ):
        success_count = 0
        plateau_total = 0
        for _ in range(trials):
            best_state, _, _, plateau_hits = random_restart_hc_with_plateau_counter(
                landscape,
                RRHC_RESTARTS,
                variant="first choice",
            )
            if best_state == GLOBAL_MAX_STATE:
                success_count += 1
            plateau_total += plateau_hits
        results.append(
            {
                "label": label,
                "discovery_rate": success_count / trials,
                "avg_plateau_terminations": plateau_total / trials,
            }
        )
    return results


def print_plateau_comparison_table(results):
    print("Q2(c) RRHC discovery rate before and after plateau modification")
    print("-" * 78)
    print(
        f"{'Landscape':<30}{'Global Max Discovery Rate':<28}"
        f"{'Avg Plateau Restarts':<20}"
    )
    print("-" * 78)
    for row in results:
        print(
            f"{row['label']:<30}{row['discovery_rate']:.4f}"
            f"{'':<23}{row['avg_plateau_terminations']:.2f}"
        )
    print("-" * 78)
    print()


def main():
    print("Q2 landscape:", Q2_LANDSCAPE)
    print("Global maximum state:", GLOBAL_MAX_STATE)
    print("Local maxima:", find_local_maxima(Q2_LANDSCAPE))
    print()

    random.seed(REPRODUCIBLE_SEED)
    for variant in ("first choice", "stochastic"):
        best_state, best_value, all_results = random_restart_hc(
            Q2_LANDSCAPE,
            RRHC_RESTARTS,
            variant=variant,
        )
        print_restart_table(
            f"Q2(a) RRHC restart table using {variant}",
            Q2_LANDSCAPE,
            all_results,
        )
        print(
            f"Best terminal state under {variant}: {best_state} "
            f"with f-value {best_value}"
        )
        print()

    random.seed()
    empirical = print_empirical_probability_table(Q2_LANDSCAPE)
    theoretical = print_theoretical_probability_table()

    print("Q2(b) Empirical vs theoretical probabilities")
    print("-" * 44)
    print(f"{'n':<8}{'Empirical':<14}{'Theoretical':<14}")
    print("-" * 44)
    for n in RESTART_COUNTS:
        print(f"{n:<8}{empirical[n]:.4f}{'':<10}{theoretical[n]:.4f}")
    print("-" * 44)
    print()

    random.seed()
    plateau_results = compare_plateau_discovery_rates()
    print_plateau_comparison_table(plateau_results)

    random.seed(REPRODUCIBLE_SEED)
    _, _, _, plateau_counter = random_restart_hc_with_plateau_counter(
        Q2_PLATEAU_LANDSCAPE,
        RRHC_RESTARTS,
        variant="first choice",
    )
    print(
        "Plateau counter for one 20-restart run on the modified landscape:",
        plateau_counter,
    )


if __name__ == "__main__":
    main()
