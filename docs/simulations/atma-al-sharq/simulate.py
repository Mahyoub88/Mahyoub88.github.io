"""Terrain and link-budget simulation of the Atma -> MTN tower site -> Al-Sharq backhaul.

Inputs: profiles.json (public Copernicus 90 m elevations; see fetch_profiles.py) and
ASSUMPTIONS below. Radio figures are typical class values for the equipment named in the
planning document, NOT measurements; verify against datasheets and field readings.
Run:  python docs/simulations/atma-al-sharq/simulate.py
"""
import json, math, pathlib

HERE = pathlib.Path(__file__).parent
MEDIA = HERE.parents[2] / "public/projects/proj-wireless-link-planning/media"

ASSUMPTIONS = {
    "frequency_mhz": 5800,
    "k_factor": 4 / 3,
    "clutter_allowance_m": 5,
    "cable_loss_db_per_end": 0.5, "other_loss_db": 2.0,
    "sensitivity_low_rate_dbm": -96, "sensitivity_high_rate_dbm": -77,
    "required_fade_margin_db": 10,
    "H1": {"equipment": "PowerBeam M5 400 pair", "gain_dbi": 25, "tx_dbm": 25},
    "H2": {"equipment": "Rocket M5 with 34 dBi dish pair", "gain_dbi": 34, "tx_dbm": 27},
}
A = ASSUMPTIONS
RE = 6371000.0; LAMBDA = 299.792458 / A["frequency_mhz"]

def fspl(d_km): return 32.44 + 20 * math.log10(A["frequency_mhz"]) + 20 * math.log10(d_km)

def analyse(h, mast):
    el = h["elev"]; n = len(el); D = h["distance_km"] * 1000; worst = None
    for i in range(1, n - 1):
        x = D * i / (n - 1)
        bulge = x * (D - x) / (2 * A["k_factor"] * RE)
        los = el[0] + mast + (el[-1] - el[0]) * x / D
        clear = los - (el[i] + bulge + A["clutter_allowance_m"])
        f1 = math.sqrt(LAMBDA * x * (D - x) / D)
        if worst is None or clear / f1 < worst["ratio"]:
            worst = {"ratio": clear / f1, "at_km": x / 1000, "clearance_m": clear, "f1_m": f1}
    return worst

def required(h, target):
    return next((m for m in range(0, 61) if analyse(h, m)["ratio"] >= target), None)

def budget(h):
    r = A[h["id"]]; loss = fspl(h["distance_km"])
    pr = r["tx_dbm"] + 2 * r["gain_dbi"] - 2 * A["cable_loss_db_per_end"] - A["other_loss_db"] - loss
    lo, hi = A["sensitivity_low_rate_dbm"], A["sensitivity_high_rate_dbm"]
    return {"fspl_db": loss, "rx_dbm": pr, "margin_low_rate_db": pr - lo, "margin_high_rate_db": pr - hi,
            "high_rate_after_fade_db": pr - hi - A["required_fade_margin_db"]}

def svg(h, mast):
    W, H, L, R, T, B = 1240, 560, 40, 40, 100, 70
    el = h["elev"]; n = len(el); D = h["distance_km"] * 1000
    xs = [D * i / (n - 1) for i in range(n)]
    terr = [e + x * (D - x) / (2 * A["k_factor"] * RE) for e, x in zip(el, xs)]
    los = [el[0] + mast + (el[-1] - el[0]) * x / D for x in xs]
    f1 = [math.sqrt(LAMBDA * x * (D - x) / D) for x in xs]
    lo = min(terr) - 40; hi = max(max(terr), max(los)) + 60
    X = lambda x: L + (W - L - R) * x / D
    Y = lambda v: T + (H - T - B) * (1 - (v - lo) / (hi - lo))
    poly = " ".join(f"{X(x):.1f},{Y(t):.1f}" for x, t in zip(xs, terr))
    up = " ".join(f"{X(x):.1f},{Y(l + f):.1f}" for x, l, f in zip(xs, los, f1))
    dn = " ".join(f"{X(x):.1f},{Y(l - f):.1f}" for x, l, f in reversed(list(zip(xs, los, f1))))
    r = analyse(h, mast)
    title = f"{h['from']} to {h['to']}: terrain profile, line of sight and first Fresnel zone"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d"><title id="t">{title}</title><desc id="d">Planning simulation from public elevation data with {mast} m masts. A model result, not a field measurement.</desc><rect width="{W}" height="{H}" rx="18" fill="#0a0e18"/><g font-family="Arial,sans-serif"><text x="40" y="42" fill="#5b9dff" font-size="16">PLANNING SIMULATION · NOT A FIELD MEASUREMENT</text><text x="40" y="76" fill="#f5f7fb" font-size="24">{h['from']} → {h['to']} · {h['distance_km']:.1f} km · {A['frequency_mhz']/1000:g} GHz · {mast} m masts</text>
<polygon points="{up} {dn}" fill="#5b9dff" fill-opacity=".16" stroke="#5b9dff" stroke-opacity=".6" stroke-dasharray="6 5"/>
<polygon points="{X(0):.1f},{H-B} {poly} {X(D):.1f},{H-B}" fill="#1d3552" stroke="#2a4a6e" stroke-width="2"/>
<polyline points="{' '.join(f'{X(x):.1f},{Y(l):.1f}' for x, l in zip(xs, los))}" fill="none" stroke="#5b9dff" stroke-width="3"/>
<text x="{L}" y="{H-B+28}" fill="#b7c0d4" font-size="15">{h['from']} · {el[0]:.0f} m</text><text x="{W-R}" y="{H-B+28}" fill="#b7c0d4" font-size="15" text-anchor="end">{h['to']} · {el[-1]:.0f} m</text>
<text x="40" y="{H-14}" fill="#b7c0d4" font-size="15">Tightest point: {r['at_km']:.1f} km along the hop, {r['ratio']*100:.0f}% of the first Fresnel radius clear. Earth bulge k=4/3, {A['clutter_allowance_m']} m clutter allowance, 90 m DEM.</text></g></svg>
'''

def main():
    hops = json.loads((HERE / "profiles.json").read_text())["hops"]
    out = {"assumptions": A, "hops": {}}
    for h in hops:
        req = {"60%": required(h, 0.6), "100%": required(h, 1.0)}
        out["hops"][h["id"]] = {
            "from": h["from"], "to": h["to"], "distance_km": h["distance_km"],
            "elev_from_m": h["elev"][0], "elev_to_m": h["elev"][-1], "max_terrain_m": max(h["elev"]),
            "required_mast_m": req,
            "by_mast": {str(m): analyse(h, m) for m in (3, 6, 10, 20)},
            "budget": budget(h)}
        mast = req["60%"] if req["60%"] is not None else 20
        (MEDIA / f"atma-al-sharq-{h['id'].lower()}-profile.svg").write_text(svg(h, max(mast, 3)), encoding="utf-8")
    (HERE / "results.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    for k, v in out["hops"].items():
        print(k, round(v["distance_km"], 2), v["elev_from_m"], v["elev_to_m"], v["max_terrain_m"], v["required_mast_m"],
              {m: (round(r["ratio"], 2), round(r["clearance_m"])) for m, r in v["by_mast"].items()},
              {a: round(b, 1) for a, b in v["budget"].items()})

main()
