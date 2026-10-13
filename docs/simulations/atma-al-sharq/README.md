# Atma to Al-Sharq engineering review

The implemented project connects Atma, an intermediate MTN tower area and Al-Sharq, with local distribution in seven zones. The source requirements are the author's original document. The calculations below are a new engineering review of that project, not recorded commissioning measurements.

## Current calculation

Run `python reviewed_simulation.py` with Python 3, numpy and matplotlib. It writes `reviewed-results.json`, `reviewed-budget.csv` and six figures to the case-study media directory. `profiles.json` is the existing 61-point terrain profile; no new terrain service request or precise-coordinate publication is required. Figures are actual outputs of this calculation.

The manufacturer TX and sensitivity tables are transcribed separately for PowerBeam M5 400 and Rocket M5, at all MCS indices 0 through 15. MCS0-7 uses one spatial stream and MCS8-15 uses two. The PHY rates assume 20 MHz and an 800 ns guard interval. A 50% payload efficiency is an illustrative assumption, not measured throughput. Sensitivity tables are manufacturer nominal figures and are not an interference model.

PowerBeam has an integrated antenna: no external RF-feed loss is added to H1. H2 assumes 0.5 dB RF-feed loss per end. Both assume 2 dB other losses. Free-space budgets use 5.8 GHz. Maximum table powers characterize hardware capability; they do not authorize those EIRPs. The 36, 40 and 44 dBm caps are sensitivity cases, not Yemen regulatory limits.

The ±2 dB TX and ±2 dB receiver sensitivity tolerances can consume 4 dB of the nominal margin. Antenna tolerance, interference and alignment errors remain separate.

## Actual UISP captures

UISP Design Center at https://ispdesign.ui.com/ was operated in Guest mode on 2026-10-12 using the supplied planning coordinates with user authorization. Manual product selection used the original legacy equipment:

| Input or vendor prediction | H1 | H2 |
|---|---|---|
| Equipment | PowerBeam M5 400 pair | Rocket M5 and RD-5G34 pair |
| Antenna gain | 25 dBi | 34 dBi |
| Antenna height above ground | 6 m at each end | 6 m at each end |
| Displayed frequency | 5,000 MHz | 5,500 MHz |
| Channel width | 20 MHz | 20 MHz |
| Auto TX shown in detail table | 26 dBm | 27 dBm |
| Displayed path length | 8.31 km | 15.64 km |
| Expected signal | -49 dBm | -36 dBm |
| Displayed capacity under Noise Free setting | 84.5 Mbps | 84.5 Mbps |

These are vendor predictions. They are not comparable to the 5.8 GHz calculation without accounting for different frequency, feed and other loss, terrain sampling and modulation-dependent TX power. UISP reported LIDAR data unavailable in this area. The screenshot crops preserve the result panel and exclude precise coordinates. Full private captures are retained only in the task's local scratch directory, outside the public repository.

## Terrain and uncertainty limits

The source estimated distances are 8.5 km and 16.5 km. The existing profile distances are 8.277 km and 15.556 km. The three planning locations remain provisional; the comparison does not establish surveyed mounting points.

Copernicus GLO-90 has approximately 90 m grid resolution. The 61-point profile samples are about 138 m and 259 m apart. Buildings, trees, rooftop mounting points and narrow ridges can be missed. The nominal geometry uses a 5 m clutter allowance and k=4/3, with Earth curvature added once to terrain. The endpoints are excluded from the clearance-ratio minimum because the Fresnel radius is zero there. Survey the endpoint approaches separately.

The Monte Carlo result is the fraction of 5,000 assumed scenarios that meets a criterion at sampled points. It is not observed availability, a calibrated probability of obstruction or a confidence level. Endpoint DEM error is held fixed and error between samples is unresolved. Neither 10 m nor 15 m is a certified mast height. Survey, structural design and wind loading govern final antenna height.

Annual rain and multipath outage are intentionally not reported in the reviewed model. The legacy calculation used unverified local climate parameters and converted a propagation probability to annual minutes without demonstrating applicability and time basis. An availability design requires a verified recommendation edition, valid geometry domain, local climate data and worst-month/annual conversion where applicable, plus power and equipment outage.

## Source documents

- Author's Atma to Al-Sharq requirements DOCX/PDF: original estimated distances, equipment, zone map and historical cost lines.
- PowerBeam datasheet: https://dl.ui.com/datasheets/powerbeam/PowerBeam_DS.pdf (PBE-M5-400 specifications, page 8).
- Rocket M datasheet: https://dl.ui.com/datasheets/rocketm/RocketM_DS.pdf (M5 specifications, pages 6-7).
- NanoStation M datasheet: https://dl.ui.com/datasheets/nanostationm/nsm_ds_web.pdf (NSM2 specifications, page 10).
- RocketDish specifications: https://techspecs.ui.com/uisp/wireless/rd-5g
- Elevation API: https://open-meteo.com/en/docs/elevation-api
- Free-space attenuation: https://www.itu.int/rec/R-REC-P.525/en
- Terrestrial LOS planning: https://www.itu.int/rec/R-REC-P.530/en

## Legacy files

`simulate.py`, `results.json` and their original SVG figures remain for traceability. They are superseded for the current public conclusions by `reviewed_simulation.py` and `reviewed-results.json`. In particular, the legacy H1 TX offset, doubled one-stream rate, annual outage and blanket cross-polarisation recommendation must not be reused as current design conclusions.
