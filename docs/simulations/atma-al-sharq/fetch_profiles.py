"""Fetch terrain profiles (public Copernicus 90 m DEM via Open-Meteo) for the two hops.

Usage:  python fetch_profiles.py LAT,LON LAT,LON LAT,LON
Order:  Atma centre, MTN tower site, Al-Sharq city.
Exact planning coordinates are not committed: the stored profile keeps
coordinates rounded to 0.01 degree (about 1 km). Elevations are unchanged.
"""
import json, math, pathlib, sys, urllib.request

def hav(p, q):
    R = 6371.0088
    f1, f2 = math.radians(p[0]), math.radians(q[0]); dl = math.radians(q[1] - p[1])
    a = math.sin((f2 - f1) / 2) ** 2 + math.cos(f1) * math.cos(f2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

def profile(a, b, n=61):
    pts = [(a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)) for i in range(n)]
    url = "https://api.open-meteo.com/v1/elevation?latitude=%s&longitude=%s" % (
        ",".join("%.6f" % p[0] for p in pts), ",".join("%.6f" % p[1] for p in pts))
    req = urllib.request.Request(url, headers={"User-Agent": "portfolio-planning/1.0"})
    return json.load(urllib.request.urlopen(req))["elevation"]

def main():
    s = [tuple(map(float, x.split(","))) for x in sys.argv[1:4]]
    rd = lambda p: [round(p[0], 2), round(p[1], 2)]
    out = {"note": "Coordinates rounded to 0.01 degree; elevations from the exact line.",
           "hops": [
        {"id": "H1", "from": "Atma centre", "to": "MTN tower site", "a": rd(s[0]), "b": rd(s[1]),
         "distance_km": hav(s[0], s[1]), "elev": profile(s[0], s[1])},
        {"id": "H2", "from": "MTN tower site", "to": "Al-Sharq city", "a": rd(s[1]), "b": rd(s[2]),
         "distance_km": hav(s[1], s[2]), "elev": profile(s[1], s[2])}]}
    (pathlib.Path(__file__).parent / "profiles.json").write_text(json.dumps(out, indent=1))
    for h in out["hops"]: print(h["id"], round(h["distance_km"], 2), "km", h["elev"][0], h["elev"][-1], max(h["elev"]))

main()
