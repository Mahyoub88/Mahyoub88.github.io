"""Planning simulation: Atma -> Al-Sharq (Dhamar) point-to-point link.

Inputs: docs/simulations/atma-al-sharq/profiles.json (60 samples of public
Copernicus-DEM elevations via Open-Meteo, approximate OpenStreetMap
coordinates) and the ASSUMPTIONS below. Nothing here is a field measurement.
Run:  python docs/simulations/atma-al-sharq/simulate.py
"""
import json, math, pathlib

HERE = pathlib.Path(__file__).parent
MEDIA = HERE.parents[2] / "public/projects/proj-wireless-link-planning/media"

ASSUMPTIONS = {
    "frequency_mhz": 5500,
    "tx_power_dbm": 23,
    "dish_gain_dbi": 25,
    "cable_loss_db_per_end": 0.5,
    "other_loss_db": 2.0,            # connectors, polarisation, radome, misc.
    "rx_sensitivity_dbm": -80,       # assumed mid-rate modulation threshold
    "required_fade_margin_db": 10,
    "k_factor": 4 / 3,
    "clutter_allowance_m": 5,        # trees/buildings not in a 90 m DEM
    "clearance_targets": [0.6, 1.0], # fraction of first Fresnel radius
    # distribution at the far end (illustrative)
    "ap_sector_gain_dbi": 16, "ap_tx_dbm": 24, "cpe_gain_dbi": 16,
    "cpe_sensitivity_dbm": -80, "path_loss_exponent": 3.2, "clutter_db": 6,
}
A = ASSUMPTIONS
C = 299.792458  # m/us -> wavelength in m = C / f_MHz
RE = 6371000.0

def fspl(f_mhz, d_km):
    return 32.44 + 20 * math.log10(f_mhz) + 20 * math.log10(d_km)

def analyse(p, h, i0=0, i1=None, h1=None):
    """Worst first-Fresnel clearance ratio between samples i0 and i1."""
    el = p["elev"]; n = len(el); i1 = n - 1 if i1 is None else i1
    h1 = h if h1 is None else h1
    step = p["distance_km"] * 1000 / (n - 1)
    D = step * (i1 - i0); lam = C / A["frequency_mhz"]
    worst = (1e9, 0, 0)
    for i in range(i0 + 1, i1):
        x = step * (i - i0)
        bulge = x * (D - x) / (2 * A["k_factor"] * RE)
        los = el[i0] + h + (el[i1] + h1 - el[i0] - h) * x / D
        clear = los - (el[i] + bulge + A["clutter_allowance_m"])
        f1 = math.sqrt(lam * x * (D - x) / D)
        r = clear / f1
        if r < worst[0]: worst = (r, (step * i0 + x) / 1000, clear)
    return {"ratio": worst[0], "at_km": worst[1], "clearance_m": worst[2], "hop_km": D / 1000}

SITING_SAMPLES = 6  # masts may be moved up to this many samples (~0.6-1.4 km) from the nominal point

def search(p, relay, target=0.6):
    """Smallest equal mast height meeting `target` first-Fresnel clearance on every hop.
    Source and destination may move within SITING_SAMPLES of the nominal point;
    with relay=True one intermediate relay site is searched on the straight path."""
    n = len(p["elev"])
    srcs = range(0, SITING_SAMPLES); dsts = range(n - SITING_SAMPLES, n)
    for h in range(2, 41):
        found = []
        for s_ in srcs:
            for t_ in dsts:
                if not relay:
                    r = analyse(p, h, s_, t_)
                    if r["ratio"] >= target: found.append((r["ratio"], s_, None, t_, [r]))
                    continue
                for m in range(s_ + 3, t_ - 2):
                    a, b = analyse(p, h, s_, m), analyse(p, h, m, t_)
                    q = min(a["ratio"], b["ratio"])
                    if q >= target: found.append((q, s_, m, t_, [a, b]))
        if found:
            q, s_, m, t_, hops = max(found, key=lambda f: (f[0] > target and 0, f[0]))
            pts = [s_] + ([m] if m is not None else []) + [t_]
            return {"mast_m": h, "points": pts, "hops": hops,
                    "site_elev_m": [p["elev"][i] for i in pts],
                    "site_km": [p["distance_km"] * i / (n - 1) for i in pts],
                    "budgets": [hop_budget(x["hop_km"]) for x in hops]}
    return None

def best_effort(p, h=40):
    """Most favourable single-relay layout at mast height h, even if it fails the target."""
    n = len(p["elev"]); best = None
    for s_ in range(SITING_SAMPLES):
        for t_ in range(n - SITING_SAMPLES, n):
            for m in range(s_ + 3, t_ - 2):
                hops = [analyse(p, h, s_, m), analyse(p, h, m, t_)]
                q = min(x["ratio"] for x in hops)
                if best is None or q > best[0]: best = (q, [s_, m, t_], hops)
    q, pts, hops = best
    return {"mast_m": h, "points": pts, "hops": hops, "site_elev_m": [p["elev"][i] for i in pts],
            "site_km": [p["distance_km"] * i / (n - 1) for i in pts], "budgets": [hop_budget(x["hop_km"]) for x in hops]}

def budget(p):
    d = p["distance_km"]; loss = fspl(A["frequency_mhz"], d)
    pr = (A["tx_power_dbm"] + 2 * A["dish_gain_dbi"] - 2 * A["cable_loss_db_per_end"]
          - A["other_loss_db"] - loss)
    margin = pr - A["rx_sensitivity_dbm"]
    return {"fspl_db": loss, "rx_dbm": pr, "margin_db": margin,
            "after_fade_db": margin - A["required_fade_margin_db"]}

def hop_budget(d_km):
    loss = fspl(A["frequency_mhz"], d_km)
    pr = (A["tx_power_dbm"] + 2 * A["dish_gain_dbi"] - 2 * A["cable_loss_db_per_end"]
          - A["other_loss_db"] - loss)
    return {"distance_km": d_km, "fspl_db": loss, "rx_dbm": pr, "margin_db": pr - A["rx_sensitivity_dbm"],
            "after_fade_db": pr - A["rx_sensitivity_dbm"] - A["required_fade_margin_db"]}

def gain_sweep(p):
    rows = []
    for g in (19, 23, 25, 30):
        d = p["distance_km"]; loss = fspl(A["frequency_mhz"], d)
        pr = A["tx_power_dbm"] + 2 * g - 2 * A["cable_loss_db_per_end"] - A["other_loss_db"] - loss
        rows.append({"gain_dbi": g, "rx_dbm": pr, "margin_db": pr - A["rx_sensitivity_dbm"]})
    return rows

def distribution():
    # range at which a 16 dBi CPE still has the fade margin, log-distance model
    eirp = A["ap_tx_dbm"] + A["ap_sector_gain_dbi"]
    pl1 = 32.44 + 20 * math.log10(A["frequency_mhz"]) - 60  # FSPL at 1 m
    out = []
    for rssi_margin in (0, 10, 15):
        allow = eirp + A["cpe_gain_dbi"] - A["cpe_sensitivity_dbm"] - rssi_margin - A["clutter_db"]
        r = 10 ** ((allow - pl1) / (10 * A["path_loss_exponent"]))
        out.append({"fade_margin_db": rssi_margin, "range_m": r})
    return out

def svg(p, key, h, plan=None):
    W, H, L, R, T, B = 1240, 560, 70, 30, 90, 70
    el, D = p["elev"], p["distance_km"] * 1000
    n = len(el); lam = C / A["frequency_mhz"]
    xs = [D * i / (n - 1) for i in range(n)]
    bul = [x * (D - x) / (2 * A["k_factor"] * RE) for x in xs]
    terr = [e + b for e, b in zip(el, bul)]
    los = [el[0] + h + (el[-1] - el[0]) * x / D for x in xs]
    pts = plan["points"]
    los = [None] * n; f1 = [0] * n
    for a0, a1 in zip(pts, pts[1:]):
        Dh = D / (n - 1) * (a1 - a0)
        for i in range(a0, a1 + 1):
            xh = D / (n - 1) * (i - a0)
            los[i] = el[a0] + h + (el[a1] + h - el[a0] - h) * xh / Dh
            f1[i] = math.sqrt(max(lam * xh * (Dh - xh) / Dh, 0))
    vals = [l for l in los if l is not None]; lo = min(terr) - 40; hi = max(max(terr), max(vals)) + max(f1) + 40
    X = lambda x: L + (W - L - R) * x / D
    Y = lambda v: T + (H - T - B) * (1 - (v - lo) / (hi - lo))
    poly = " ".join(f"{X(x):.1f},{Y(t):.1f}" for x, t in zip(xs, terr))
    ground = f"{X(0):.1f},{H-B} " + poly + f" {X(D):.1f},{H-B}"
    idx = list(range(pts[0], pts[-1] + 1))
    up = " ".join(f"{X(xs[i]):.1f},{Y(los[i]+f1[i]):.1f}" for i in idx)
    dn = " ".join(f"{X(xs[i]):.1f},{Y(los[i]-f1[i]):.1f}" for i in reversed(idx))
    f6u = " ".join(f"{X(xs[i]):.1f},{Y(los[i]-0.6*f1[i]):.1f}" for i in idx)
    los_line = " ".join(f"{X(xs[i]):.1f},{Y(los[i]):.1f}" for i in idx)
    ground = f"{X(0):.1f},{H-B} " + poly + f" {X(D):.1f},{H-B}"
    r = {"ratio": min(x["ratio"] for x in plan["hops"]), "at_km": 0}
    worst = min(plan["hops"], key=lambda x: x["ratio"]); r["at_km"] = worst["at_km"]
    labs = ["ATMA SITE"] + ["RELAY"] * (len(pts) == 3) + ["AL-SHARQ SITE"]
    mark = ""
    for j, (i, lab) in enumerate(zip(pts, labs)):
        last = j == len(pts) - 1; first = j == 0
        ly = Y(terr[i]) + 26 if last else Y(los[i]) - f1[i] - 14
        anc = "end" if last else ("start" if first else "middle")
        lx = X(xs[i]) + (-6 if last else 6 if first else 0)
        mark += (f'<line x1="{X(xs[i]):.1f}" y1="{Y(terr[i]):.1f}" x2="{X(xs[i]):.1f}" y2="{Y(los[i]):.1f}" stroke="#22d3a6" stroke-width="4"/>'
                 f'<text x="{lx:.1f}" y="{ly:.1f}" fill="#22d3a6" font-size="15" text-anchor="{anc}">{lab} · {el[i]:.0f} m</text>')
    t = f"Atma to {p['name']}: terrain profile, line of sight and first Fresnel zone"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d"><title id="t">{t}</title><desc id="d">Planning simulation using public elevation data and a {h} m antenna height at each end. A model result, not a field measurement.</desc><rect width="{W}" height="{H}" rx="18" fill="#0a0e18"/><g font-family="Arial,sans-serif"><text x="40" y="42" fill="#5b9dff" font-size="16">PLANNING SIMULATION · NOT A FIELD MEASUREMENT</text><text x="40" y="72" fill="#f5f7fb" font-size="24">Atma → {p['name']} · {p['distance_km']:.1f} km · {A['frequency_mhz']/1000:g} GHz · {h} m masts · {'one relay' if len(pts)==3 else 'direct'} · {'MEETS 60% clearance' if r['ratio']>=0.6 else 'OBSTRUCTED: fails 60% clearance'}</text>
<polygon points="{up} {dn}" fill="#5b9dff" fill-opacity=".16" stroke="#5b9dff" stroke-opacity=".6" stroke-dasharray="6 5"/>
<polyline points="{f6u}" fill="none" stroke="#f5b83d" stroke-width="1.5" stroke-dasharray="3 4"/>
<polygon points="{ground}" fill="#1d3552" stroke="#2a4a6e" stroke-width="2"/>
<polyline points="{los_line}" fill="none" stroke="#5b9dff" stroke-width="3"/>
{mark}
<text x="40" y="{H-16}" fill="#b7c0d4" font-size="15">Tightest point: {r['at_km']:.1f} km along the profile, {'terrain above the line of sight' if r['ratio']<0 else str(round(r['ratio']*100))+'% of the first Fresnel radius clear'} (dotted amber = 60% line). Earth bulge k=4/3, {A['clutter_allowance_m']} m clutter allowance, 90 m DEM.</text></g></svg>
'''

def main():
    profiles = json.loads((HERE / "profiles.json").read_text())
    results = {"assumptions": A, "scenarios": {}}
    for key, p in profiles.items():
        results["scenarios"][key] = {
            "name": p["name"], "distance_km": p["distance_km"],
            "elev_a_m": p["elev"][0], "elev_b_m": p["elev"][-1],
            "max_terrain_m": max(p["elev"]), "budget": budget(p), "gain_sweep": gain_sweep(p)}
        direct = search(p, False); relay = search(p, True)
        results["scenarios"][key]["direct_sited"] = direct
        results["scenarios"][key]["relay_sited"] = relay
        results["scenarios"][key]["direct_30m_nominal"] = analyse(p, 30)
        results["scenarios"][key]["best_effort_40m"] = None if (direct or relay) else best_effort(p)
        plan = direct or relay or results["scenarios"][key]["best_effort_40m"]
        (MEDIA / f"atma-al-sharq-{key.lower()}-profile.svg").write_text(svg(p, key, plan["mast_m"], plan), encoding="utf-8")
    results["distribution"] = distribution()
    (HERE / "results.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    for k, v in results["scenarios"].items():
        print(k, round(v["distance_km"], 1), "km")
        for nm in ("direct_sited", "relay_sited", "best_effort_40m"):
            x = v[nm]
            print(" ", nm, x and (x["mast_m"], x["points"], [round(h["ratio"], 2) for h in x["hops"]], [round(h["hop_km"], 1) for h in x["hops"]], [round(b["margin_db"], 1) for b in x["budgets"]], x["site_elev_m"]))
    print(results["distribution"])

main()
