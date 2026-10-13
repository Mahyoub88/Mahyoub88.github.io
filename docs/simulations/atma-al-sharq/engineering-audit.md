# Engineering audit and completion record

## Resolved in this review

1. **Radio-specific data:** replaced the Rocket M5 TX table offset used for PowerBeam with the actual PBE-M5-400 table. Removed external RF-feed loss from the integrated PowerBeam antenna.
2. **MIMO indexing:** replaced doubled MCS0-7 rates with explicit MCS0-15 TX, sensitivity and PHY tables. MCS15 is the two-stream 130 Mbps PHY case at 20 MHz/800 ns GI. Application throughput remains an assumption.
3. **Availability:** withdrew the legacy annual outage claims. Climate, prediction domain and worst-month versus annual time basis were not established. No measured uptime is available.
4. **Co-location:** withdrew fixed 60 MHz channel separation, fixed 2 m dish separation and blanket cross-polarisation advice. Both MIMO chains must be preserved. Use spectrum measurements, antenna patterns, channel/bandwidth limits and a co-site desensitisation test to determine separation and channels.
5. **Power:** maximum TX is a capability case, not a default commissioning setting. Added EIRP sensitivity and TX/sensitivity tolerance. Final country profile and permitted EIRP must be verified for the site before configuration.
6. **Mast heights:** the 10-15 m values are scenario inputs, not surveyed or structurally approved installation heights. Added sample-spacing and model-boundary disclosures.
7. **Photos and simulation:** added actual UISP output captures and manufacturer product imagery, each labelled separately from original project documentation. No stock product image is presented as an installation photograph.
8. **Equipment completeness:** RocketDish and sector antennas need compatible radios. The original '15 dBi M5 120' line does not identify an exact sector SKU or attached radio. The 2.4 GHz NanoStation cannot directly join a 5 GHz sector over RF; their interconnection must be Ethernet or separate compatible radios.
9. **Solar feed:** explicitly included the need for a regulated compatible 24 V passive-PoE feed from a 12 V battery design. The solar sizing excludes routers and auxiliary loads until measured.
10. **Budget:** historical source line totals are kept separate from current procurement cost. Backhaul $1,380 + zone devices $2,090 + two routers $420 = $3,890. This is a subtotal; uncertain currency/unit basis and unspecified power quantities prevent a complete project total.

## Remaining evidence and design inputs

| Priority | Missing item | Why it matters | Completion evidence |
|---|---|---|---|
| High | Confirm exact mounting points and surveyed heights | Resolves distance and near-site clearance | Site survey and annotated path profiles |
| High | Actual device/antenna inventory, firmware and mode | Confirms M5 SKU, radio/antenna pairs and client compatibility | Inventory and configuration exports |
| High | Legal channel/EIRP and spectrum scans | Determines permitted power and interference | Applicable limits, country setting and scans at all endpoints |
| High | RSSI per chain, noise, MCS and link quality | Validates the model against the installed link | Timestamped airOS captures and logs |
| High | End-to-end payload tests, directions and offered load | Establishes actual shared service capacity | iperf3 records and latency/loss tests |
| High | Electrical load, winter solar resource and battery condition | Finalises remote-site autonomy | Load and battery measurements, PV design record |
| Medium | Zone bearings, heights and client inventory | Replaces generic coverage with a site-specific coverage design | Map with actual AP/clients and validation points |
| Medium | Mount, grounding and surge-protection records | Supports installation integrity | Site photos and inspection record |
| Medium | Full priced bill of materials | Clarifies missing radios, PoE and currency | Supplier quotation with date, currency and quantities |
| Medium | Monitoring and failover record | Supports uptime claims | At least seven days of logs plus failure/recovery test |

The implemented status follows the author's project record. Missing public acceptance evidence does not change that status; it limits which performance claims can be independently verified.
