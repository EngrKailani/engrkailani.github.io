"""Self-contained unit tests for synthetic S2P inputs only."""
import math
import tempfile
import unittest
from pathlib import Path

from s2p_audit import read_s2p


class S2PTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "synthetic.s2p"

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, body):
        self.path.write_text(body, encoding="utf-8")

    def test_db_magnitude_order_and_vswr(self):
        self.write("# GHz S DB R 50\n1 -20 0 -3 0 -60 0 -10 0\n")
        p = read_s2p(self.path)["measurements"][0]
        self.assertAlmostEqual(p["S11_dB"], -20)
        self.assertAlmostEqual(p["S21_dB"], -3)
        self.assertAlmostEqual(p["S12_dB"], -60)
        self.assertAlmostEqual(p["VSWR"], 1.1 / 0.9)
        self.assertAlmostEqual(p["input_impedance_ohms"]["real"], 50 * 1.1 / 0.9)

    def test_ri_wrapped_record_and_mhz(self):
        self.write("# MHz S RI R 75\n100 0.0 0.5 0.4 0.0\n0.1 0.0 -0.5 0.0\n")
        d = read_s2p(self.path)
        self.assertEqual(d["number_of_points"], 1)
        self.assertEqual(d["measurements"][0]["frequency_Hz"], 100e6)
        self.assertAlmostEqual(d["measurements"][0]["S21_dB"], 20*math.log10(0.4))

    def test_ma_phase(self):
        self.write("# HZ S MA R 50\n100000000 0.25 90 0.8 -90 0.001 0 0.1 0\n")
        d = read_s2p(self.path)["measurements"][0]
        self.assertAlmostEqual(d["S11_complex"]["real"], 0, places=8)
        self.assertAlmostEqual(d["S11_complex"]["imag"], 0.25)
        self.assertAlmostEqual(d["S21_complex"]["imag"], -0.8)

    def test_rejects_nonmonotonic_frequency(self):
        self.write("# GHz S DB R 50\n1 -20 0 0 0 0 0 -20 0\n1 -20 0 0 0 0 0 -20 0\n")
        with self.assertRaises(ValueError):
            read_s2p(self.path)

    def test_rejects_touchstone_v2(self):
        self.write("[Version] 2.0\n# GHz S MA R 50\n1 1 0 1 0 1 0 1 0\n")
        with self.assertRaises(ValueError):
            read_s2p(self.path)

    def test_example_is_synthetic_and_complete(self):
        example = Path(__file__).parent.parent / "examples" / "synthetic_twoport.s2p"
        d = read_s2p(example)
        self.assertEqual(d["number_of_points"], 3)
        self.assertEqual(d["measurements"][0]["frequency_Hz"], 100e6)
        self.assertEqual(d["measurements"][-1]["frequency_Hz"], 6e9)


    def test_matched_reciprocal_attenuator_is_passivity_compatible(self):
        self.write("# GHz S RI R 50\n1 0 0 0.5 0 0.5 0 0 0\n")
        d = read_s2p(self.path)["measurements"][0]["diagnostics"]
        self.assertAlmostEqual(d["maximum_power_gain"], 0.25)
        self.assertTrue(d["passivity_compatible"])
        self.assertAlmostEqual(d["reciprocity_difference_abs"], 0)

    def test_gain_device_exceeds_passive_power_bound(self):
        self.write("# GHz S RI R 50\n1 0 0 2 0 0 0 0 0\n")
        d = read_s2p(self.path)["measurements"][0]["diagnostics"]
        self.assertAlmostEqual(d["maximum_power_gain"], 4)
        self.assertFalse(d["passivity_compatible"])
        self.assertAlmostEqual(d["reciprocity_difference_abs"], 2)

    def test_one_way_attenuator_is_not_reciprocal(self):
        self.write("# GHz S RI R 50\n1 0 0 0.5 0 0 0 0 0\n")
        d = read_s2p(self.path)["measurements"][0]["diagnostics"]
        self.assertAlmostEqual(d["maximum_power_gain"], 0.25)
        self.assertTrue(d["passivity_compatible"])
        self.assertAlmostEqual(d["reciprocity_difference_abs"], 0.5)

    def test_spectral_bound_detects_coupled_matrix(self):
        # Both column powers equal one, yet coherent excitation can yield
        # gain > 1. A separate per-column check would miss this.
        self.write("# GHz S RI R 50\n1 0.8 0 0.6 0 0.6 0 0.8 0\n")
        d = read_s2p(self.path)["measurements"][0]["diagnostics"]
        self.assertAlmostEqual(d["maximum_power_gain"], 1.96)
        self.assertFalse(d["passivity_compatible"])
        self.assertAlmostEqual(d["reciprocity_difference_abs"], 0)

    def test_ideal_through_at_passivity_boundary(self):
        self.write("# GHz S RI R 50\n1 0 0 1 0 1 0 0 0\n")
        d = read_s2p(self.path)["measurements"][0]["diagnostics"]
        self.assertAlmostEqual(d["maximum_power_gain"], 1)
        self.assertTrue(d["passivity_compatible"])
        self.assertAlmostEqual(d["reciprocity_difference_abs"], 0)


if __name__ == "__main__":
    unittest.main()
