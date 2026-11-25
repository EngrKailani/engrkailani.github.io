# Published three-link leg source: reproducibility and equation review

**Source:** [Original MATLAB text listing](https://github.com/EngrKailani/3link-sim/blob/main/MatLabCode), University of Nevada, Reno Honors Signature Experience (Spring 2025).  
**Independent check:** [`scripts/leg-equation-check.js`](../scripts/leg-equation-check.js), added to the portfolio in November 2026.

## What can be inspected

The public source defines a Level-2 MATLAB S-function with two three-element input ports for joint angles and angular rates. Its four outputs are planar position x and y, a two-component foot velocity, and a three-component torque expression.

The source gives illustrative link lengths **L1 = 1**, **L2 = 1**, **L3 = 0.5**, without an explicit physical length unit. The position and Jacobian formulas use the cumulative joint angles, and foot velocity is derived from the Jacobian multiplied by angular rates.

## Important dynamic-model limitation

The listing constructs an inertia matrix **M**, velocity-dependent terms **C**, and a gravity vector **G**. However, its final reported torque is **C × joint rates + G**. The inertia matrix is not used in that return expression, and the S-function has no joint-acceleration input. Thus, it does **not** compute the full inverse-dynamics torque for accelerating joints, which would require an **M × joint acceleration** term (and may require other validated model terms).

This is a source-scope clarification, not a judgment about the intention of the Honors project. The code is an educational three-link model and cannot on its own substantiate measured joint loads, gait reproduction, prosthetic performance, or a calibrated human-leg model.

## Independent mathematical spot checks

These are new checks of the **published position and Jacobian equations**, not archived results from the original MATLAB/Simulink project.

| Case | Joint angles (rad) | Joint rates (rad/s) | Foot position (source units) | Foot velocity (source units/s) |
| --- | --- | --- | --- | --- |
| Straight | (0, 0, 0) | (0.1, 0, 0) | (2.5, 0) | (0, 0.25) |
| Vertical | (π/2, 0, 0) | (0, 0.1, 0) | (0, 2.5) | (-0.15, 0) |
| Bent | (π/6, -π/3, π/6) | (0, 0, 0) | (√3 + 0.5, 0) | (0, 0) |

The same checker compares the analytical Jacobian against centered finite differences at three declared angle configurations. It rejects non-finite or incorrect-length input vectors.

## How to repeat

From the portfolio repository, run:

```bash
node scripts/leg-equation-check.js
```

The script uses only JavaScript built-ins and hard-coded public source length values. Its output includes the expected worked cases and a failure exit code if a position, velocity, or derivative identity differs from the reference.

The original archived MATLAB text includes a prefatory label and is not a ready-to-run Simulink project file. Rerunning the original project requires the S-function in an executable MATLAB file and a suitably configured Simulink model. **This portfolio checker neither runs MATLAB nor asserts compatibility with an unrecovered Simulink model.**

## Validation that remains open

- A runnable, version-pinned MATLAB/Simulink model with documented inputs.
- Independent verification of the dynamic equations and inertia contribution.
- Defined physical link lengths, masses, units, coordinate conventions, and source provenance.
- Measured joint/foot motion and synchronized comparisons for any claims of gait accuracy.

No physical or NASA hardware measurements are used in this review.
