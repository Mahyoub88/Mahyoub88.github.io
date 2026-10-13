import unittest
import reviewed_simulation as s

class RFReviewTests(unittest.TestCase):
 def test_known_free_space_example(self):
  self.assertAlmostEqual(s.fspl(2,5000),112.44,places=2)
 def test_distance_doubling(self):
  self.assertAlmostEqual(s.fspl(4)-s.fspl(2),6.0206,places=4)
 def test_invalid_units(self):
  for km,mhz in [(0,5800),(1,0),(-1,5800)]:
   with self.assertRaises(ValueError):s.fspl(km,mhz)
 def test_powerbeam_has_own_tx_table(self):
  self.assertEqual(s.RADIOS['H1']['tx'][7],23)
  self.assertEqual(s.RADIOS['H1']['tx'][15],23)
  self.assertEqual(s.RADIOS['H2']['tx'][15],21)
 def test_stream_index_changes_sensitivity(self):
  b=s.budget({'id':'H1','distance_km':8.277307634730152})
  self.assertEqual(b['rows'][7]['streams'],1)
  self.assertEqual(b['rows'][15]['streams'],2)
  self.assertEqual(b['rows'][7]['phy_mbps'],65)
  self.assertEqual(b['rows'][15]['phy_mbps'],130)
  self.assertAlmostEqual(b['rows'][15]['rx_dbm'],-55.06634,places=4)
  self.assertAlmostEqual(b['rows'][15]['margin_db'],19.93366,places=4)
 def test_eirp_cap_changes_rate_selection(self):
  b=s.budget({'id':'H1','distance_km':8.277307634730152},36)
  self.assertTrue(all(r['eirp_dbm']<=36 for r in b['rows']))
  self.assertAlmostEqual(b['rows'][15]['margin_db'],7.93366,places=4)
  self.assertEqual(b['highest_phy_with_10db_margin']['mcs'],14)
 def test_clearance_uses_curvature_once(self):
  h={'distance_km':2,'elev':[0,0,0]}
  p=s.profile(h,mast=10,k=4/3,clutter=0)
  self.assertAlmostEqual(p['obstruction'][1],0.05886,places=4)
  self.assertAlmostEqual(p['f1'][1],5.08372,places=4)

if __name__=='__main__':unittest.main()
