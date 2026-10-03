# Software-Defined Networking — OpenFlow Automation & Video Streaming Control

Built an SDN lab with Mininet, Open vSwitch (OpenFlow 1.3) and the Ryu controller, programmed entirely through the controller REST API: flow tables are generated and installed automatically, and OpenFlow meters control the quality of a live video stream.

## Role

End-to-end design, implementation, programming, testing and technical documentation.

## Topology

Three OpenFlow 1.3 switches in a line (s1–s2–s3) with two hosts each (h1–h6), 100 Mbit/s host links and 20 Mbit/s trunks, attached to Ryu `ofctl_rest`.

## Automation

Python REST client (plus a Postman collection) for the Ryu ofctl_rest API. Flow tables for the three switches are computed from the topology and installed in 21 REST calls (0.038 s). After the s3 flow table is wiped (h4 → h6: 100 % loss), connectivity is restored in 7 REST calls (0.008 s, 0 % loss).

## Streaming

A 2.5 Mbit/s H.264 stream is sent from h1 to h6 across all three switches and rate-limited with OpenFlow 1.3 meters at 3000, 1500 and 800 kbit/s. Received quality is measured with FFmpeg PSNR/SSIM.

## Results

| Meter | PSNR | SSIM |
|---|---|---|
| None | 39.5 dB | 0.998 |
| 3000 kbit/s | 40.6 dB | 0.998 |
| 1500 kbit/s | 19.3 dB | 0.819 |
| 800 kbit/s | 15.4 dB | 0.706 |

All REST-call logs, flow dumps, meter statistics and raw results are published in the repository.

## Technologies

Ryu, OpenFlow 1.3, Open vSwitch, Mininet, Python, REST APIs, QoS (OpenFlow meters), FFmpeg, Video Streaming

## Links

- [GitHub repository — code, results & figures](https://github.com/Mahyoub88/sdn-openflow-lab)
- [Portfolio project](https://mahyoub88.github.io/#proj-sdn)
