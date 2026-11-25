# Proposed independent study protocol: Reliable tool handling with incomplete sensing

**Status:** Research design only. No experiments, datasets, hardware tests, or performance results are claimed.  
**Scope:** Public, non-NASA simulation with generic robot geometry and simulated sensor/contact measurements.

## Question

When does a state estimator improve end-effector tracking and safe task completion for a robotic manipulator operating with noisy, delayed, or missing observations, and under which conditions does it perform worse than a nominal baseline?

The use case is a generic tool-alignment task relevant to constrained space operations, **not** an operational lunar, orbital, or NASA system.

## Proposed platform and open materials

Use a generic 6-DOF manipulator in a publicly reproducible simulation, for example MuJoCo with a ROS 2 integration if supported by the available environment. Declare the simulator version, robot geometry, contact parameters, controller gains, timestep, observation model, and random seeds. Make the benchmark task, scripts, parameter files, metrics, and generated synthetic data public when implemented.

The existing [planar 3R teaching example](../robotics-experiment.html) demonstrates seeded noise and endpoint-error reporting; it does **not** establish the 6-DOF results proposed here.

## Predeclared comparison

| Component | Baseline | Estimation-informed candidate |
| --- | --- | --- |
| Sensing | Noisy observation used directly | State estimate from a specified estimator |
| Controller | Same control law and tuning policy | Identical control law receiving estimated state |
| Task and disturbances | Identical trajectories and random seeds | Identical trajectories and random seeds |
| Information access | No hidden true-state input | No hidden true-state input |
| Evaluation | Same metrics and stop conditions | Same metrics and stop conditions |

Candidate estimators include a documented Kalman-style filter or another justified estimator. Any tuning on trial data would be separated from final evaluation seeds.

## Proposed test matrix

1. **Nominal observation:** low-noise, no dropout, no contact uncertainty.
2. **Position uncertainty:** increasing simulated sensor noise within a published parameter sweep.
3. **Incomplete feedback:** intermittent, time-bounded measurement gaps with declared distributions.
4. **Latency:** controlled observation delay and update-rate changes.
5. **Model mismatch:** controlled variation in assumed tool offset and inertial or friction parameters.
6. **Contact:** simulated tool alignment with varied contact stiffness and friction, after collision safeguards are defined.

Each cell would use the same preselected seed set for both strategies. A true system state may be recorded **for offline scoring only**, never fed secretly to either controller.

## Metrics and reporting

- Root-mean-square and 95th-percentile end-effector position error, in millimeters.
- Task success rate, failure mode and time to completion.
- Peak contact force, collision or constraint violations where the physics model supports them.
- Recovery time following sensing loss; estimation consistency when measurable.
- Computation time and reproducibility across seeds.

Report paired differences, uncertainty intervals and all predeclared scenarios, including negative results. Do not collapse task failures into a tracking-error average that conceals noncompletion.

## Verification and release gates

- Verify the kinematics and simulator timebase against independent analytical cases.
- Add automated tests for deterministic seeds, unit conversions, limits and deliberately missing observations.
- Check that both approaches use identical task initialization, observations and contact assumptions.
- Inspect representative trajectories visually and publish numeric values alongside plots.
- Separate synthetic and physical measurements explicitly. No hardware outcome is claimed until independent tests are performed.
- Review all data and graphics for intellectual-property and confidentiality restrictions before release.

## Current next action

Implement the generic benchmark and publish a first controlled baseline. Until code, scenarios, and trial outcomes are actually available, **this is a proposal, not a completed project or publication**.
