"""Sizing of the solar power system for the MTN relay site (design calculation, not a measurement).

Loads: one PowerBeam M5 400 (about 8 W) and one Rocket M5 (about 8 W) per the manufacturers' typical
power consumption, plus 10 % for PoE injectors and cable loss. Insolation and efficiencies are assumptions.
Run:  python docs/simulations/atma-al-sharq/relay_power.py
"""
import json, math, pathlib

A = {"radio_w": [8, 8], "overhead": 0.10, "autonomy_days": 3, "system_voltage_v": 12,
     "peak_sun_hours_design": 4.5, "pv_system_efficiency": 0.70, "pv_margin": 1.5,
     "battery_roundtrip": 0.85, "dod_lead_acid": 0.5, "dod_lifepo4": 0.8, "controller_margin": 1.25}
load_w = sum(A["radio_w"]) * (1 + A["overhead"])
day_wh = load_w * 24
pv_w = day_wh / (A["peak_sun_hours_design"] * A["pv_system_efficiency"])
out = {"assumptions": A, "load_w": load_w, "daily_wh": day_wh,
       "pv_minimum_w": pv_w, "pv_recommended_w": pv_w * A["pv_margin"],
       "battery_ah_lead_acid_12v": day_wh * A["autonomy_days"] / (A["dod_lead_acid"] * A["battery_roundtrip"] * A["system_voltage_v"]),
       "battery_ah_lifepo4_12v": day_wh * A["autonomy_days"] / (A["dod_lifepo4"] * A["battery_roundtrip"] * A["system_voltage_v"]),
       "controller_a": pv_w * A["pv_margin"] * A["controller_margin"] / A["system_voltage_v"]}
pathlib.Path(__file__).with_name("relay_power.json").write_text(json.dumps(out, indent=2))
print(json.dumps({k: round(v, 1) for k, v in out.items() if isinstance(v, float)}, indent=1))
