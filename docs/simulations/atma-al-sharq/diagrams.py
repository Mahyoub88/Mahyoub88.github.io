"""Explanatory diagrams for the Atma -> MTN site -> Al-Sharq network (design proposals, not as-built drawings).

Writes two SVGs to public/projects/proj-wireless-link-planning/media/.
Run:  python docs/simulations/atma-al-sharq/diagrams.py
"""
import json, pathlib

HERE = pathlib.Path(__file__).parent
MEDIA = HERE.parents[2] / "public/projects/proj-wireless-link-planning/media"
BG, CARD, LINE, INK, SUB, ACC, GRN, AMB = "#0a0e18", "#121828", "#2c4468", "#f5f7fb", "#b7c0d4", "#5b9dff", "#22d3a6", "#f5b83d"

def box(x, y, w, h, title, lines, col=ACC):
    t = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{CARD}" stroke="{col}" stroke-width="2"/><text x="{x+16}" y="{y+32}" fill="{INK}" font-size="19" font-weight="700">{title}</text>'
    for i, l in enumerate(lines):
        t += f'<text x="{x+16}" y="{y+58+i*22}" fill="{SUB}" font-size="15">{l}</text>'
    return t

def arrow(x1, y1, x2, y2, col=ACC, label=""):
    s = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="3" marker-end="url(#a)"/>'
    if label: s += f'<text x="{(x1+x2)/2}" y="{(y1+y2)/2-10}" fill="{col}" font-size="15" text-anchor="middle">{label}</text>'
    return s

def wrap(w, h, title, desc, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="t d"><title id="t">{title}</title><desc id="d">{desc}</desc>'
            f'<defs><marker id="a" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9z" fill="{SUB}"/></marker></defs>'
            f'<rect width="{w}" height="{h}" rx="18" fill="{BG}"/><g font-family="Arial,sans-serif"><text x="40" y="40" fill="{ACC}" font-size="15">EXPLANATORY DIAGRAM · DESIGN PROPOSAL, NOT AN AS-BUILT DRAWING</text>'
            f'<text x="40" y="74" fill="{INK}" font-size="26">{title}</text>{body}</g></svg>\n')

def architecture():
    b = box(40, 130, 230, 150, "Atma centre", ["Internet source", "Netgear modems per line", "RB 750 combines lines", "PowerBeam M5 400"])
    b += box(340, 130, 250, 150, "MTN tower site", ["Mountain-top relay, 2680 m", "PowerBeam + Rocket M5", "Solar, battery, regulator", "Lightning protection"], AMB)
    b += box(660, 130, 250, 150, "Al-Sharq core", ["Rocket Dish M5 34 dBi", "MikroTik RB AH 1100", "Switching and routing", "Management VLAN"], GRN)
    b += arrow(270, 205, 340, 205, ACC, "") + arrow(590, 205, 660, 205, GRN, "")
    b += f'<text x="305" y="312" fill="{ACC}" font-size="15" text-anchor="middle">Hop 1 · 8.3 km</text><text x="625" y="312" fill="{GRN}" font-size="15" text-anchor="middle">Hop 2 · 15.6 km</text>'
    b += arrow(910, 205, 960, 205, GRN, "")
    # zones
    zx = 960
    b += f'<rect x="{zx}" y="110" width="260" height="360" rx="14" fill="none" stroke="{LINE}" stroke-dasharray="6 5"/><text x="{zx+16}" y="138" fill="{INK}" font-size="18" font-weight="700">Distribution zones</text>'
    zones = [("Zone 1", "2 NanoStation + 15 dBi sector"), ("Zones 4, 6, 12, 14", "PowerBeam + 2 NanoStation each"), ("Zones 10, 13", "PowerBeam + 3 NanoStation each")]
    for i, (z, d) in enumerate(zones):
        y = 155 + i * 100
        b += f'<rect x="{zx+14}" y="{y}" width="232" height="86" rx="10" fill="{CARD}" stroke="{GRN}"/><text x="{zx+28}" y="{y+30}" fill="{INK}" font-size="17" font-weight="700">{z}</text><text x="{zx+28}" y="{y+56}" fill="{SUB}" font-size="14">{d}</text><text x="{zx+28}" y="{y+76}" fill="{SUB}" font-size="13">about 500 m planned range</text>'
    b += f'<text x="40" y="400" fill="{SUB}" font-size="17">Backhaul carries one shared ceiling of about 65 Mbps at 20 MHz (assumption).</text>'
    b += f'<text x="40" y="430" fill="{SUB}" font-size="17">Hop 2 masts of 10 to 15 m and a dish tilted about -5 degrees (simulation result).</text>'
    b += f'<text x="40" y="460" fill="{SUB}" font-size="17">Separate management, transport and subscriber VLANs; routing and queues at the core.</text>'
    return wrap(1260, 500, "Network architecture: Atma to Al-Sharq", "Block diagram of the two-hop backhaul through the MTN tower site and the seven distribution zones in Al-Sharq. Design proposal.", b)

def relay_site():
    p = json.loads((HERE / "relay_power.json").read_text())
    b = ''
    # mast
    b += f'<rect x="130" y="150" width="14" height="300" fill="{LINE}"/><rect x="60" y="440" width="150" height="14" rx="4" fill="{LINE}"/>'
    b += f'<ellipse cx="86" cy="190" rx="14" ry="42" fill="{CARD}" stroke="{ACC}" stroke-width="3" transform="rotate(-4 86 190)"/><text x="40" y="262" fill="{ACC}" font-size="15">Hop 1 dish</text>'
    b += f'<ellipse cx="190" cy="250" rx="16" ry="56" fill="{CARD}" stroke="{GRN}" stroke-width="3" transform="rotate(5 190 250)"/><text x="150" y="332" fill="{GRN}" font-size="15">Hop 2 dish</text>'
    b += f'<text x="60" y="480" fill="{SUB}" font-size="15">10-15 m mast · grounded</text>'
    # power chain
    items = [("Solar array", f"{p['pv_recommended_w']:.0f} W recommended", AMB), ("MPPT regulator", f"about {p['controller_a']:.0f} A, 12 V", AMB), ("Battery bank", f"{p['battery_ah_lifepo4_12v']:.0f} Ah LiFePO4 or {p['battery_ah_lead_acid_12v']:.0f} Ah lead-acid", AMB), ("PoE injectors", "two radios, 24 V PoE", ACC), ("Radios", f"load about {p['load_w']:.0f} W", GRN)]
    x = 330
    for i, (t, d, c) in enumerate(items):
        b += box(x + i * 0, 120 + i * 70, 560, 58, t, [], c).replace(f'y="{120+i*70+32}"', f'y="{120+i*70+26}"')
        b += f'<text x="{x+16}" y="{120+i*70+48}" fill="{SUB}" font-size="15">{d}</text>'
        if i < len(items) - 1:
            b += f'<line x1="{x+280}" y1="{120+i*70+58}" x2="{x+280}" y2="{120+(i+1)*70}" stroke="{SUB}" stroke-width="3" marker-end="url(#a)"/>'
    b += f'<text x="330" y="500" fill="{SUB}" font-size="15">Design basis: {p["daily_wh"]:.0f} Wh per day, {p["assumptions"]["autonomy_days"]} days of autonomy, {p["assumptions"]["peak_sun_hours_design"]} peak sun hours, 70% system efficiency.</text>'
    b += f'<text x="330" y="526" fill="{SUB}" font-size="15">Surge protection on every Ethernet run; one earth electrode shared by the mast, the array and the cabinet.</text>'
    return wrap(1180, 560, "MTN relay site: mast and solar power", "Sketch of the relay mast with two dishes and the solar power chain feeding two radios, with the sizing results from the design calculation. Design proposal.", b)

(MEDIA / "atma-al-sharq-architecture.svg").write_text(architecture(), encoding="utf-8")
(MEDIA / "atma-al-sharq-relay-site.svg").write_text(relay_site(), encoding="utf-8")
print("ok")
