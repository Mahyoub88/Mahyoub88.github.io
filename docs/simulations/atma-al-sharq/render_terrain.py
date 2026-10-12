"""Render data-driven terrain images for the Atma -> MTN site -> Al-Sharq network.

Outputs (public/projects/proj-wireless-link-planning/media/):
  atma-al-sharq-relief.webp   shaded-relief map with the two hops
  atma-al-sharq-3d.webp       oblique 3D view of the same terrain
  atma-al-sharq-osm.webp      OpenStreetMap basemap with the two hops (c) OpenStreetMap contributors

Data: public Copernicus 90 m elevations through the Open-Meteo API; map tiles from OpenStreetMap.
Pure Python plus Pillow (no numpy). Exact planning coordinates are passed on the command line and are
not stored in the repository; the images show positions only at map scale.

Usage: python render_terrain.py ATMA_LAT,LON MTN_LAT,LON SHARQ_LAT,LON [cache_dir]
"""
import json, math, pathlib, sys, time, urllib.error, urllib.request
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).parent
MEDIA = HERE.parents[2] / "public/projects/proj-wireless-link-planning/media"
UA = {"User-Agent": "portfolio-planning/1.0 (personal engineering portfolio)"}
STEP = 0.003  # degrees, about 330 m (the elevation API allows about 600 points per minute)
FONT = "C:/Windows/Fonts/segoeuib.ttf"

def fetch_grid(lat0, lat1, lon0, lon1, cache):
    rows = int(round((lat1 - lat0) / STEP)) + 1; cols = int(round((lon1 - lon0) / STEP)) + 1
    f = cache / f"dem_{rows}x{cols}.json"
    if f.exists(): return json.loads(f.read_text())
    pts = [(lat1 - r * STEP, lon0 + c * STEP) for r in range(rows) for c in range(cols)]
    el = []
    for i in range(0, len(pts), 100):
        chunk = pts[i:i + 100]
        url = "https://api.open-meteo.com/v1/elevation?latitude=%s&longitude=%s" % (
            ",".join("%.5f" % p[0] for p in chunk), ",".join("%.5f" % p[1] for p in chunk))
        for attempt in range(12):
            try:
                el += json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))["elevation"]; break
            except urllib.error.HTTPError as e:
                time.sleep(65 if e.code == 429 else 5)
            except Exception:
                time.sleep(5)
        else:
            raise SystemExit("elevation API failed")
        time.sleep(11)
    grid = [el[r * cols:(r + 1) * cols] for r in range(rows)]
    f.write_text(json.dumps(grid)); return grid

def bilinear(grid, fr, fc):
    r0, c0 = int(fr), int(fc); r1, c1 = min(r0 + 1, len(grid) - 1), min(c0 + 1, len(grid[0]) - 1)
    a, b = fr - r0, fc - c0
    return (grid[r0][c0] * (1 - a) * (1 - b) + grid[r0][c1] * (1 - a) * b + grid[r1][c0] * a * (1 - b) + grid[r1][c1] * a * b)

RAMP = [(1200, (46, 94, 70)), (1700, (96, 128, 78)), (2100, (160, 150, 98)), (2500, (170, 128, 92)), (2900, (230, 225, 215))]
def tint(z):
    if z <= RAMP[0][0]: return RAMP[0][1]
    for (z0, c0), (z1, c1) in zip(RAMP, RAMP[1:]):
        if z <= z1:
            t = (z - z0) / (z1 - z0); return tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))
    return RAMP[-1][1]

def shade(grid, r, c, dx, dy, az=315, alt=40, ex=1.6):
    R, C = len(grid), len(grid[0])
    rm, rp, cm, cp = max(r - 1, 0), min(r + 1, R - 1), max(c - 1, 0), min(c + 1, C - 1)
    dzdx = (grid[r][cp] - grid[r][cm]) / ((cp - cm) * dx) * ex
    dzdy = (grid[rm][c] - grid[rp][c]) / ((rp - rm) * dy) * ex
    slope = math.atan(math.hypot(dzdx, dzdy)); aspect = math.atan2(dzdy, -dzdx)
    zen, azr = math.radians(90 - alt), math.radians(az)
    return max(0.0, math.cos(zen) * math.cos(slope) + math.sin(zen) * math.sin(slope) * math.cos(azr - aspect))

def font(size):
    try: return ImageFont.truetype(FONT, size)
    except Exception: return ImageFont.load_default()

def label(d, xy, text, size=26, anchor="la"):
    f = font(size)
    d.text(xy, text, font=f, fill=(255, 255, 255), anchor=anchor, stroke_width=3, stroke_fill=(10, 14, 24))

def marker(d, xy, text, colour, size=26, off=(14, -34)):
    x, y = xy
    d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=colour, outline=(255, 255, 255), width=3)
    label(d, (x + off[0], y + off[1]), text, size)

def relief(grid, lat1, lon0, sites, sub=4, up=5):
    R0, C0 = len(grid), len(grid[0]); lat_mid = lat1 - (R0 - 1) * STEP / 2
    fine = [[bilinear(grid, r / sub, c / sub) for c in range((C0 - 1) * sub + 1)] for r in range((R0 - 1) * sub + 1)]
    R, C = len(fine), len(fine[0])
    dy = STEP * 111000 / sub; dx = STEP * 111000 * math.cos(math.radians(lat_mid)) / sub
    img = Image.new("RGB", (C, R)); px = img.load()
    for r in range(R):
        for c in range(C):
            k = 0.35 + 0.85 * shade(fine, r, c, dx, dy); col = tint(fine[r][c])
            px[c, r] = tuple(min(255, int(v * k)) for v in col)
    scale = sub * up
    img = img.resize((C * up, R * up), Image.BICUBIC)
    d = ImageDraw.Draw(img); H = img.height
    pos = {n: ((lo - lon0) / STEP * scale, (lat1 - la) / STEP * scale) for n, (la, lo) in sites.items()}
    for a_, b_, col in (("Atma", "MTN", (91, 157, 255)), ("MTN", "Al-Sharq", (34, 211, 166))):
        d.line([pos[a_], pos[b_]], fill=(10, 14, 24), width=9); d.line([pos[a_], pos[b_]], fill=col, width=5)
    for n, col, off in (("Atma", (91, 157, 255), (16, 8)), ("MTN", (245, 184, 61), (-16, 8)), ("Al-Sharq", (34, 211, 166), (16, -40))):
        marker(d, pos[n], {"Atma": "Atma", "MTN": "MTN tower site", "Al-Sharq": "Al-Sharq"}[n], col, off=off)
    label(d, (24, H - 56), "Shaded relief from public 90 m elevation data · hop 1 blue, hop 2 green", 24)
    return img

def view3d(grid, lat1, lon0, sites, W=1600, H=900, sub=3, EX=1.6):
    R0, C0 = len(grid), len(grid[0]); lat_mid = lat1 - (R0 - 1) * STEP / 2
    kxs = STEP * 111.0 * math.cos(math.radians(lat_mid)); kys = STEP * 111.0     # km per source cell
    fine = [[bilinear(grid, r / sub, c / sub) for c in range((C0 - 1) * sub + 1)] for r in range((R0 - 1) * sub + 1)]
    R, C = len(fine), len(fine[0]); kx, ky = kxs / sub, kys / sub
    cam = ((C0 - 1) * kxs * 0.55, -11.0, 5.3)                                    # km: x east, y north, z up
    pitch = math.radians(9); f = W * 1.0
    sp, cp = math.sin(pitch), math.cos(pitch)
    def proj(xk, yk, zm):
        X = xk - cam[0]; Y = yk - cam[1]; Z = zm * EX / 1000 - cam[2]
        depth = Y * cp - Z * sp; up = Y * sp + Z * cp
        if depth <= 0.5: return None
        return (W / 2 + f * X / depth, H * 0.66 - f * up / depth, depth)
    img = Image.new("RGB", (W, H)); d = ImageDraw.Draw(img)
    for y in range(H):  # sky gradient
        t = y / H; d.line([(0, y), (W, y)], fill=(int(110 + 100 * t), int(150 + 80 * t), int(205 + 40 * t)))
    dy = ky * 1000; dx = kx * 1000
    pts = [[proj(c * kx, (R - 1 - r) * ky, fine[r][c]) for c in range(C)] for r in range(R)]
    for r in range(R - 2, -1, -1):   # back (north) to front (south)
        for c in range(C - 1):
            p = [pts[r][c], pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c]]
            if any(q is None for q in p): continue
            z = (fine[r][c] + fine[r][c + 1] + fine[r + 1][c + 1] + fine[r + 1][c]) / 4
            sh = shade(fine, r, c, dx, dy, az=300, alt=35, ex=1.4); k = 0.40 + 0.85 * sh
            col = tint(z); dep = p[0][2]; haze = min(0.6, max(0.0, (dep - 14) / 55))
            col = tuple(int((col[i] * k) * (1 - haze) + (178, 198, 224)[i] * haze) for i in range(3))
            d.polygon([(q[0], q[1]) for q in p], fill=col)
    front = [q for q in pts[R - 1] if q is not None]
    if front:
        d.polygon([(q[0], q[1]) for q in front] + [(front[-1][0], H), (front[0][0], H)], fill=(52, 64, 50))
    pos = {}
    for n, (la, lo) in sites.items():
        xk = (lo - lon0) / STEP * kxs; yk = (la - (lat1 - (R0 - 1) * STEP)) / STEP * kys
        z = bilinear(grid, (lat1 - la) / STEP, (lo - lon0) / STEP)
        pos[n] = (proj(xk, yk, z), proj(xk, yk, z + 140))   # base and mast-top marker (drawn tall for visibility)
    for a_, b_, col in (("Atma", "MTN", (91, 157, 255)), ("MTN", "Al-Sharq", (34, 211, 166))):
        pa, pb = pos[a_][1], pos[b_][1]
        d.line([(pa[0], pa[1]), (pb[0], pb[1])], fill=(10, 14, 24), width=9); d.line([(pa[0], pa[1]), (pb[0], pb[1])], fill=col, width=5)
    for n, text, col, off in (("Atma", "Atma", (91, 157, 255), (14, -44)), ("MTN", "MTN tower site", (245, 184, 61), (-14, -44)), ("Al-Sharq", "Al-Sharq", (34, 211, 166), (14, -44))):
        bpt, t = pos[n]; d.line([(bpt[0], bpt[1]), (t[0], t[1])], fill=(255, 255, 255), width=3)
        marker(d, (t[0], t[1]), text, col, size=28, off=off)
    label(d, (24, H - 52), "Oblique view from the south, vertical scale exaggerated 1.6x · public 90 m elevation data", 24)
    return img

def osm_map(lat0, lat1, lon0, lon1, sites, z=13):
    n = 2 ** z
    tx = lambda lon: (lon + 180) / 360 * n
    ty = lambda lat: (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    x0, x1 = int(tx(lon0)), int(tx(lon1)); y0, y1 = int(ty(lat1)), int(ty(lat0))
    img = Image.new("RGB", ((x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256))
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            req = urllib.request.Request(f"https://tile.openstreetmap.org/{z}/{x}/{y}.png", headers=UA)
            img.paste(Image.open(__import__("io").BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert("RGB"), ((x - x0) * 256, (y - y0) * 256))
            time.sleep(0.3)
    d = ImageDraw.Draw(img)
    pos = {k: ((tx(lo) - x0) * 256, (ty(la) - y0) * 256) for k, (la, lo) in sites.items()}
    for a, b, col in (("Atma", "MTN", (30, 90, 220)), ("MTN", "Al-Sharq", (10, 160, 120))):
        d.line([pos[a], pos[b]], fill=(255, 255, 255), width=11); d.line([pos[a], pos[b]], fill=col, width=6)
    for k, col, off in (("Atma", (30, 90, 220), (16, 8)), ("MTN", (230, 150, 20), (-16, 8)), ("Al-Sharq", (10, 160, 120), (16, -40))):
        x, y = pos[k]; d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=col, outline=(255, 255, 255), width=3)
        f = font(26); d.text((x + off[0], y + off[1]), {"Atma": "Atma", "MTN": "MTN tower site", "Al-Sharq": "Al-Sharq"}[k], font=f, fill=(20, 20, 20), stroke_width=4, stroke_fill=(255, 255, 255))
    d.rectangle((0, img.height - 34, 470, img.height), fill=(255, 255, 255))
    d.text((8, img.height - 30), "© OpenStreetMap contributors", font=font(20), fill=(40, 40, 40))
    return img

def main():
    s = [tuple(map(float, a.split(","))) for a in sys.argv[1:4]]
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    cache = pathlib.Path(args[3]) if len(args) > 3 else pathlib.Path(".")
    sites = {"Atma": s[0], "MTN": s[1], "Al-Sharq": s[2]}
    lat0, lat1 = round(min(p[0] for p in s) - 0.03, 2), round(max(p[0] for p in s) + 0.03, 2)
    lon0, lon1 = round(min(p[1] for p in s) - 0.04, 2), round(max(p[1] for p in s) + 0.04, 2)
    grid = fetch_grid(lat0, lat1, lon0, lon1, cache)
    print("grid", len(grid), "x", len(grid[0]), "z", min(map(min, grid)), max(map(max, grid)))
    relief(grid, lat1, lon0, sites).save(MEDIA / "atma-al-sharq-relief.webp", quality=88)
    view3d(grid, lat1, lon0, sites).save(MEDIA / "atma-al-sharq-3d.webp", quality=88)
    if "--skip-osm" not in sys.argv:
        osm_map(lat0, lat1, lon0, lon1, sites).save(MEDIA / "atma-al-sharq-osm.webp", quality=88)
    print("done")

main()
