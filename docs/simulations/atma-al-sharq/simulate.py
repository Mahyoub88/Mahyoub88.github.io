"""Engineering simulation of the Atma -> MTN tower site -> Al-Sharq backhaul and the Al-Sharq distribution.

What this models (all PLANNING-LEVEL, none of it measured):
  1. Terrain clearance on both hops (public 90 m DEM, profiles.json) with k-factor screens.
  2. Link margin per modulation rate using manufacturer-reported transmit power and sensitivity.
  3. Propagation reliability: ITU-R P.530 multipath model and ITU-R P.838/P.530 rain model.
  4. Monte Carlo clearance under terrain-model error, clutter and refractivity (k) uncertainty.
  5. Antenna alignment tolerance and capacity per hop.
  6. Coverage reliability of a 2.4 GHz access cell with log-normal shadowing.

Inputs that are assumptions (not recovered from the deployment) are in ASSUMPTIONS.
Run:  python docs/simulations/atma-al-sharq/simulate.py
"""
import json, math, pathlib, random

HERE = pathlib.Path(__file__).parent
MEDIA = HERE.parents[2] / "public/projects/proj-wireless-link-planning/media"

ASSUMPTIONS = {
    # radio / link
    "frequency_mhz": 5800, "channel_mhz": 20,
    "cable_loss_db_per_end": 0.5, "other_loss_db": 2.0, "fade_allowance_db": 10,
    # manufacturer-reported airMAX M-series figures (Rocket M5 datasheet, MCS0..MCS7, +/-2 dB)
    "mcs_sensitivity_dbm": [-96, -95, -92, -90, -86, -83, -77, -74],
    "mcs_tx_dbm_rocket_m5": [27, 27, 27, 27, 25, 24, 22, 21],   # MCS4 value interpolated
    "mcs_rate_mbps_per_stream_20mhz": [6.5, 13, 19.5, 26, 39, 52, 58.5, 65],
    "streams": 2, "tcp_efficiency": 0.5,
    "H1": {"equipment": "PowerBeam M5 400 pair", "gain_dbi": 25, "tx_offset_db": -1},   # 26 dBm max vs 27
    "H2": {"equipment": "Rocket M5 with RocketDish 34 dBi pair", "gain_dbi": 34, "tx_offset_db": 0},
    # terrain / clearance
    "k_factor": 4 / 3, "clutter_allowance_m": 5, "mast_m": 6,
    # propagation climate (assumed, region not verified)
    "dn1_n_units_per_km": -300, "rain_rate_r001_mm_h": 40,
    # Monte Carlo
    "mc_runs": 5000, "mc_seed": 1234, "dem_smooth_error_m": 6, "dem_noise_error_m": 4,
    "mc_clutter_max_m": 15, "mc_k_mean": 4 / 3, "mc_k_sigma": 0.25,
    # access cell (NanoStation M2, 2.4 GHz)
    "cell": {"frequency_mhz": 2437, "gain_dbi": 11, "other_loss_db": 1.0, "path_loss_exponent": 3.2,
             "shadowing_sigma_db": 8,
             "tx_dbm": [28, 28, 28, 28, 26, 24, 23, 22]},                 # MCS4-6 interpolated
}
A = ASSUMPTIONS
RE = 6371000.0
LAMBDA = 299.792458 / A["frequency_mhz"]
MCS = range(8)

def fspl(d_km, f_mhz=None):
    return 32.44 + 20 * math.log10(f_mhz or A["frequency_mhz"]) + 20 * math.log10(d_km)

def erf_q(x):  # Gaussian tail probability Q(x)
    return 0.5 * math.erfc(x / math.sqrt(2))

# ---------------------------------------------------------------- terrain clearance
def clearance(el, d_km, mast, k, clutter, err=None):
    n = len(el); D = d_km * 1000; worst = None
    for i in range(1, n - 1):
        x = D * i / (n - 1)
        terr = el[i] + (err[i] if err else 0) + x * (D - x) / (2 * k * RE) + clutter
        los = el[0] + mast + (el[-1] - el[0]) * x / D
        f1 = math.sqrt(LAMBDA * x * (D - x) / D)
        r = (los - terr) / f1
        if worst is None or r < worst[0]: worst = (r, x / 1000, los - terr)
    return {"ratio": worst[0], "at_km": worst[1], "clearance_m": worst[2]}

def required_mast(h, target, k=None):
    for m in range(0, 61):
        if clearance(h["elev"], h["distance_km"], m, k or A["k_factor"], A["clutter_allowance_m"])["ratio"] >= target:
            return m
    return None

# ---------------------------------------------------------------- link budget by MCS
def hop_budget(h):
    r = A[h["id"]]; loss = fspl(h["distance_km"])
    rows = []
    for m in MCS:
        tx = A["mcs_tx_dbm_rocket_m5"][m] + r["tx_offset_db"]
        rx = tx + 2 * r["gain_dbi"] - 2 * A["cable_loss_db_per_end"] - A["other_loss_db"] - loss
        marg = rx - A["mcs_sensitivity_dbm"][m]
        rate = A["mcs_rate_mbps_per_stream_20mhz"][m] * A["streams"]
        rows.append({"mcs": m, "tx_dbm": tx, "rx_dbm": rx, "margin_db": marg, "phy_mbps": rate,
                     "tcp_mbps": rate * A["tcp_efficiency"]})
    clear_sky = max((x for x in rows if x["margin_db"] >= 0), key=lambda x: x["mcs"], default=None)
    planned = max((x for x in rows if x["margin_db"] >= A["fade_allowance_db"]), key=lambda x: x["mcs"], default=None)
    return {"fspl_db": loss, "rows": rows, "clear_sky_mcs": clear_sky and clear_sky["mcs"],
            "planned_mcs_with_fade_allowance": planned and planned["mcs"],
            "planned_tcp_mbps": planned["tcp_mbps"] if planned else 0,
            "clear_sky_tcp_mbps": clear_sky["tcp_mbps"] if clear_sky else 0}

# ---------------------------------------------------------------- reliability (ITU-R P.530 / P.838)
def multipath_percent(h, fade_db):
    el = h["elev"]; d = h["distance_km"]; mast = A["mast_m"]
    ha, hb = el[0] + mast, el[-1] + mast
    eps = abs(ha - hb) / d                         # path inclination, mrad
    hl = min(ha, hb)                               # lower antenna altitude, m
    K = 10 ** (-4.2 - 0.0029 * A["dn1_n_units_per_km"])
    p0 = K * d ** 3.1 * (1 + eps) ** -1.29 * (A["frequency_mhz"] / 1000) ** 0.8 * 10 ** (-0.00089 * hl)
    return p0 * 10 ** (-fade_db / 10), eps

def rain_attenuation(d_km, r001, p_percent):
    k, a = 0.00175, 1.308                          # ITU-R P.838 near 6 GHz (horizontal)
    gamma = k * r001 ** a
    d0 = 35 * math.exp(-0.015 * r001)
    a001 = gamma * d_km / (1 + d_km / d0)
    return a001 * 0.07 * p_percent ** -(0.855 + 0.139 * math.log10(p_percent))   # latitude < 30 deg

def rain_percent(d_km, fade_db, r001):
    lo, hi = 0.001, 1.0
    if rain_attenuation(d_km, r001, lo) < fade_db: return 0.0           # below 0.001 %
    if rain_attenuation(d_km, r001, hi) > fade_db: return 1.0
    for _ in range(60):
        mid = math.sqrt(lo * hi)
        if rain_attenuation(d_km, r001, mid) > fade_db: lo = mid
        else: hi = mid
    return mid

def reliability(h, budget):
    rows = budget["rows"]; out = {}
    for label, m in (("full_rate_mcs7", 7), ("link_loss_mcs0", 0)):
        fade = rows[m]["margin_db"]
        mp, eps = multipath_percent(h, fade)
        rn = rain_percent(h["distance_km"], fade, A["rain_rate_r001_mm_h"])
        rn_hi = rain_percent(h["distance_km"], fade, 60)
        total = mp + rn
        out[label] = {"fade_margin_db": fade, "multipath_percent": mp, "rain_percent": rn,
                      "rain_percent_at_r001_60": rn_hi, "total_percent": total,
                      "minutes_per_year": total / 100 * 525960}
    out["inclination_mrad"] = eps
    return out

# ---------------------------------------------------------------- alignment
def alignment(h):
    g = A[h["id"]]["gain_dbi"]; bw = math.sqrt(27000 / 10 ** (g / 10))
    ang = math.degrees(math.atan2(h["elev"][-1] - h["elev"][0], h["distance_km"] * 1000))
    return {"beamwidth_est_deg": bw, "tilt_deg": ang, "tol_1db_deg": bw * math.sqrt(1 / 12),
            "tol_3db_deg": bw / 2, "loss_at_1deg_db": 12 * (1 / bw) ** 2}

# ---------------------------------------------------------------- Monte Carlo
def monte_carlo(h, mast=None):
    mast = A["mast_m"] if mast is None else mast
    rnd = random.Random(A["mc_seed"] + (1 if h["id"] == "H2" else 0))
    el = h["elev"]; n = len(el); res = []; fails_near = 0; fails = 0
    for _ in range(A["mc_runs"]):
        u = rnd.uniform(0.5, 3); ph = rnd.uniform(0, 2 * math.pi); amp = rnd.gauss(0, A["dem_smooth_error_m"])
        err = [0.0] * n
        for i in range(1, n - 1):
            w = math.sin(math.pi * i / (n - 1)) ** 0.5
            err[i] = w * (amp * math.sin(2 * math.pi * u * i / (n - 1) + ph) + rnd.gauss(0, A["dem_noise_error_m"]))
        k = min(max(rnd.gauss(A["mc_k_mean"], A["mc_k_sigma"]), 0.7), 3.0)
        clutter = rnd.uniform(0, A["mc_clutter_max_m"])
        c = clearance(el, h["distance_km"], mast, k, clutter, err)
        res.append(c["ratio"])
        if c["ratio"] < 0.6:
            fails += 1
            fails_near += (c["at_km"] <= 1.0 or c["at_km"] >= h["distance_km"] - 1.0)
    res.sort(); N = len(res)
    q = lambda p: res[min(N - 1, int(p * N))]
    return {"runs": N, "p_ge_1.0": sum(r >= 1.0 for r in res) / N, "p_ge_0.6": sum(r >= 0.6 for r in res) / N,
            "p_los_clear": sum(r >= 0 for r in res) / N, "fail_share_within_1km_of_a_site": (fails_near / fails if fails else 0.0), "p5": q(0.05), "median": q(0.5), "p95": q(0.95),
            "samples": res[:: max(1, N // 500)]}

# ---------------------------------------------------------------- access cell coverage
def cell_coverage():
    c = A["cell"]; pl1 = fspl(0.001, c["frequency_mhz"])
    out = {}
    for m in (0, 3, 7):
        curve = []
        for d in range(50, 651, 50):
            pl = pl1 + 10 * c["path_loss_exponent"] * math.log10(d)
            rx = c["tx_dbm"][m] + 2 * c["gain_dbi"] - c["other_loss_db"] - pl
            need = A["mcs_sensitivity_dbm"][m] + A["fade_allowance_db"]
            curve.append({"d_m": d, "rx_median_dbm": rx, "p_cover": 1 - erf_q((rx - need) / c["shadowing_sigma_db"])})
        out[f"mcs{m}"] = curve
    return out

# ---------------------------------------------------------------- charts
BG, INK, SUB, ACC, GRN, AMB, GRID = "#0a0e18", "#f5f7fb", "#b7c0d4", "#5b9dff", "#22d3a6", "#f5b83d", "#243146"

def frame(w, h, title, desc, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="t d"><title id="t">{title}</title>'
            f'<desc id="d">{desc}</desc><rect width="{w}" height="{h}" rx="18" fill="{BG}"/><g font-family="Arial,sans-serif">'
            f'<text x="40" y="38" fill="{ACC}" font-size="15">PLANNING SIMULATION · NOT A FIELD MEASUREMENT</text>'
            f'<text x="40" y="70" fill="{INK}" font-size="24">{title}</text>{body}</g></svg>\n')

def ladder_svg(b1, b2):
    W, H, L, R, T, B = 1240, 560, 90, 40, 110, 80
    ys = [r["rx_dbm"] for r in b1["rows"] + b2["rows"]] + A["mcs_sensitivity_dbm"]
    lo, hi = min(ys) - 5, max(ys) + 5
    X = lambda m: L + (W - L - R) * m / 7
    Y = lambda v: T + (H - T - B) * (1 - (v - lo) / (hi - lo))
    g = "".join(f'<line x1="{L}" x2="{W-R}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="{GRID}"/><text x="{L-10}" y="{Y(v)+5:.1f}" fill="{SUB}" font-size="14" text-anchor="end">{v}</text>'
                for v in range(int(lo // 10 * 10) + 10, int(hi), 10))
    xl = "".join(f'<text x="{X(m):.1f}" y="{H-B+28}" fill="{SUB}" font-size="14" text-anchor="middle">MCS{m}</text>' for m in MCS)
    line = lambda vals, col, dash="": ('<polyline fill="none" stroke="%s" stroke-width="3" %s points="%s"/>' % (col, dash, " ".join(f"{X(m):.1f},{Y(v):.1f}" for m, v in zip(MCS, vals))) +
                                       "".join(f'<circle cx="{X(m):.1f}" cy="{Y(v):.1f}" r="4" fill="{col}"/>' for m, v in zip(MCS, vals)))
    body = g + xl + line(A["mcs_sensitivity_dbm"], AMB, 'stroke-dasharray="7 5"') + line([r["rx_dbm"] for r in b1["rows"]], ACC) + line([r["rx_dbm"] for r in b2["rows"]], GRN)
    leg = (f'<text x="{L}" y="{H-24}" fill="{AMB}" font-size="15">— — Receiver sensitivity</text><text x="{L+260}" y="{H-24}" fill="{ACC}" font-size="15">━ Hop 1 received level</text>'
           f'<text x="{L+520}" y="{H-24}" fill="{GRN}" font-size="15">━ Hop 2 received level</text><text x="{W-R}" y="{H-24}" fill="{SUB}" font-size="15" text-anchor="end">dBm · gap = margin</text>')
    return frame(W, H, "Received level against sensitivity, by modulation rate", "Received power on each hop compared with the receiver sensitivity at MCS0 to MCS7. The gap is the fade margin. Model result, not a measurement.", body + leg)

def hist_svg(mc1, mc2):
    W, H, L, R, T, B = 1240, 520, 70, 40, 110, 80
    lo, hi, bw = -2.0, 14.0, 0.5
    nb = int((hi - lo) / bw)
    def counts(mc):
        c = [0] * nb
        for r in mc["samples"]:
            c[min(nb - 1, max(0, int((r - lo) / bw)))] += 1
        return c
    c1, c2 = counts(mc1), counts(mc2); mx = max(c1 + c2)
    X = lambda v: L + (W - L - R) * (v - lo) / (hi - lo)
    Y = lambda v: T + (H - T - B) * (1 - v / mx)
    bars = ""
    for i in range(nb):
        for j, (c, col) in enumerate(((c1, ACC), (c2, GRN))):
            x = X(lo + i * bw) + j * (X(lo + bw) - X(lo)) / 2
            bars += f'<rect x="{x:.1f}" y="{Y(c[i]):.1f}" width="{(X(lo+bw)-X(lo))/2-1:.1f}" height="{H-B-Y(c[i]):.1f}" fill="{col}" fill-opacity=".85"/>'
    th = "".join(f'<line x1="{X(v):.1f}" x2="{X(v):.1f}" y1="{T}" y2="{H-B}" stroke="{AMB}" stroke-dasharray="6 5"/><text x="{X(v)+6:.1f}" y="{T+16+18*i}" fill="{AMB}" font-size="14">{lab}</text>' for i, (v, lab) in enumerate(((0, "0 (grazing)"), (0.6, "0.6"), (1.0, "1.0 = first Fresnel radius"))))
    xl = "".join(f'<text x="{X(v):.1f}" y="{H-B+26}" fill="{SUB}" font-size="14" text-anchor="middle">{v}</text>' for v in range(-2, 15, 2))
    leg = f'<text x="{L}" y="{H-24}" fill="{ACC}" font-size="15">■ Hop 1</text><text x="{L+120}" y="{H-24}" fill="{GRN}" font-size="15">■ Hop 2</text><text x="{W-R}" y="{H-24}" fill="{SUB}" font-size="15" text-anchor="end">Minimum clearance along the path, as a multiple of the first Fresnel radius</text>'
    return frame(W, H, "Clearance under terrain, clutter and refraction uncertainty", f"Histogram of minimum first-Fresnel clearance over {mc1['runs']} Monte Carlo runs per hop with 6 m masts. Model result, not a measurement.", bars + th + xl + leg)

def cover_svg(cov):
    W, H, L, R, T, B = 1240, 520, 80, 40, 110, 80
    X = lambda d: L + (W - L - R) * (d - 50) / 600
    Y = lambda p: T + (H - T - B) * (1 - p)
    g = "".join(f'<line x1="{L}" x2="{W-R}" y1="{Y(p/100):.1f}" y2="{Y(p/100):.1f}" stroke="{GRID}"/><text x="{L-10}" y="{Y(p/100)+5:.1f}" fill="{SUB}" font-size="14" text-anchor="end">{p}%</text>' for p in range(0, 101, 20))
    xl = "".join(f'<text x="{X(d):.1f}" y="{H-B+26}" fill="{SUB}" font-size="14" text-anchor="middle">{d}</text>' for d in range(50, 651, 100))
    cols = {"mcs0": GRN, "mcs3": ACC, "mcs7": AMB}; body = g + xl
    for key, col in cols.items():
        pts = " ".join(f"{X(c['d_m']):.1f},{Y(c['p_cover']):.1f}" for c in cov[key])
        body += f'<polyline fill="none" stroke="{col}" stroke-width="3" points="{pts}"/>'
    body += f'<line x1="{X(500):.1f}" x2="{X(500):.1f}" y1="{T}" y2="{H-B}" stroke="{SUB}" stroke-dasharray="6 5"/><text x="{X(500)-8:.1f}" y="{T+16}" fill="{SUB}" font-size="14" text-anchor="end">500 m planned range</text>'
    leg = (f'<text x="{L}" y="{H-24}" fill="{GRN}" font-size="15">━ MCS0 (basic link)</text><text x="{L+220}" y="{H-24}" fill="{ACC}" font-size="15">━ MCS3</text>'
           f'<text x="{L+340}" y="{H-24}" fill="{AMB}" font-size="15">━ MCS7 (high rate)</text><text x="{W-R}" y="{H-24}" fill="{SUB}" font-size="15" text-anchor="end">Distance from the access point, m · 10 dB fade allowance</text>')
    return frame(W, H, "Probability that a client is covered, by distance", "Coverage probability of a 2.4 GHz access point with log-normal shadowing at MCS0, MCS3 and MCS7 including a 10 dB fade allowance. Model result, not a measurement.", body + leg)

# ---------------------------------------------------------------- main
def main():
    hops = json.loads((HERE / "profiles.json").read_text())["hops"]
    out = {"assumptions": A, "hops": {}}; budgets = {}; mcs_results = {}
    for h in hops:
        b = hop_budget(h); budgets[h["id"]] = b
        mc = monte_carlo(h); mcs_results[h["id"]] = mc
        out["hops"][h["id"]] = {
            "from": h["from"], "to": h["to"], "distance_km": h["distance_km"],
            "elev_from_m": h["elev"][0], "elev_to_m": h["elev"][-1], "max_terrain_m": max(h["elev"]),
            "required_mast_m": {"60%": required_mast(h, 0.6), "100%": required_mast(h, 1.0)},
            "itu_screens": {"k_4_3": clearance(h["elev"], h["distance_km"], A["mast_m"], 4 / 3, A["clutter_allowance_m"]),
                            "k_2_3": clearance(h["elev"], h["distance_km"], A["mast_m"], 2 / 3, A["clutter_allowance_m"])},
            "budget": b, "reliability": reliability(h, b), "alignment": alignment(h),
            "monte_carlo": {k: v for k, v in mc.items() if k != "samples"},
            "monte_carlo_by_mast": {str(m): {k: v for k, v in monte_carlo(h, m).items() if k in ("p_ge_0.6", "p_los_clear", "p5")} for m in (3, 6, 10, 15, 20)}}
    cov = cell_coverage(); out["cell_coverage"] = cov
    out["backhaul"] = {"planned_tcp_mbps": min(budgets["H1"]["planned_tcp_mbps"], budgets["H2"]["planned_tcp_mbps"]),
                       "clear_sky_tcp_mbps": min(budgets["H1"]["clear_sky_tcp_mbps"], budgets["H2"]["clear_sky_tcp_mbps"])}
    (HERE / "results.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    (MEDIA / "atma-al-sharq-margin-ladder.svg").write_text(ladder_svg(budgets["H1"], budgets["H2"]), encoding="utf-8")
    (MEDIA / "atma-al-sharq-clearance-montecarlo.svg").write_text(hist_svg(mcs_results["H1"], mcs_results["H2"]), encoding="utf-8")
    (MEDIA / "atma-al-sharq-cell-coverage.svg").write_text(cover_svg(cov), encoding="utf-8")
    for k, v in out["hops"].items():
        print(k, round(v["distance_km"], 2), "km | mast req", v["required_mast_m"], "| k4/3", round(v["itu_screens"]["k_4_3"]["ratio"], 2), "k2/3", round(v["itu_screens"]["k_2_3"]["ratio"], 2))
        print("  budget fspl", round(v["budget"]["fspl_db"], 1), "clear-sky MCS", v["budget"]["clear_sky_mcs"], "planned MCS", v["budget"]["planned_mcs_with_fade_allowance"],
              "tcp", v["budget"]["clear_sky_tcp_mbps"], v["budget"]["planned_tcp_mbps"], "margins", [round(r["margin_db"], 1) for r in v["budget"]["rows"]])
        print("  rel", {a: (round(b["fade_margin_db"], 1), b["multipath_percent"], b["rain_percent"], round(b["minutes_per_year"], 4)) for a, b in v["reliability"].items() if isinstance(b, dict)}, "incl", round(v["reliability"]["inclination_mrad"], 1))
        print("  align", {a: round(b, 2) for a, b in v["alignment"].items()})
        print("  mc", {a: round(b, 3) for a, b in v["monte_carlo"].items()})
        print("  mc by mast", {m: {a: round(b, 3) for a, b in r.items()} for m, r in v["monte_carlo_by_mast"].items()})
    print("backhaul", out["backhaul"])
    for m, c in cov.items(): print(m, [(x["d_m"], round(x["rx_median_dbm"]), round(x["p_cover"], 2)) for x in c if x["d_m"] in (100, 300, 500, 600)])

main()
