# VNA recovery verification matrix

| ID | Test | Acceptance basis | Recovery status |
|---|---|---|---|
| V01 | Python S2P DB parsing | S11=-20dB, S21=-3dB, correct port order and VSWR | Passed, synthetic |
| V02 | RI wrapped records | Nonuniform record lines, MHz conversion, correct S21 magnitude | Passed, synthetic |
| V03 | MA format phase | Correct real/imaginary decomposition of phase | Passed, synthetic |
| V04 | Frequency validation | Reject repeated or decreasing frequency records | Passed, synthetic |
| V05 | Touchstone 2.0 detection | Reject unsupported directive explicitly | Passed, synthetic |
| V06 | Reconstructed example | 3 synthetic sweep points from 100MHz to 6GHz | Passed, synthetic |
| V06a | Matched and ideal through 2-port matrices | Full spectral gain 0.25 / 1.0; reciprocal difference 0 | Passed, synthetic |
| V06b | Unilateral active and nonreciprocal 2-port matrices | Distinguish passive compatibility from reciprocity | Passed, synthetic |
| V06c | Coherently coupled reciprocal matrix | Detect gain 1.96 even when both column norms equal 1 | Passed, synthetic |
| V07 | MATLAB execution | Execute analyzer with known S2P and compare numeric results | Not run, MATLAB unavailable |
| V08 | VNA identification | Original vendor/model, serial transport, reference power | Missing evidence |
| V09 | Calibration standards | Original Short/Open/Load/Thru kit coefficients and measurements | Missing evidence |
| V10 | Two-port 12-term SOLT | Compare corrected S-matrix to trusted reference over sweep | Not implemented |
| V11 | Instrument connection | Read VNA model, identify frequency settings and port routing | Not run |
| V12 | Live S11/S21 | Export matched device and known attenuator traces | Not run |
| V13 | Uncertainty and repeatability | Reconnection/recalibration results with reference standard | Not run |
| V14 | Original portfolio results | Trace original lab outputs to logged files and figures | Missing evidence |

**Provenance:** V01–V06c use synthetic test vectors and *do not* verify the original hardware. No physical measurements have been created or labeled as recovered.
