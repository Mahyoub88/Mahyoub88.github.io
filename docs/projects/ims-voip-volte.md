# IMS Lab — SIP/IMS Core, VoIP QoS & IPTV Multicast

Built a reproducible IP-multimedia lab: an IMS-style SIP core (Kamailio P-CSCF and S-CSCF, Asterisk application server) with authenticated registration and call routing, voice quality measured under congestion with and without DiffServ priority queuing, and IPTV delivery compared as unicast and multicast.

## Role

End-to-end design, implementation, programming, testing and technical documentation.

## IMS core

- HTTP-digest registration through the P-CSCF: `401 Unauthorized` → `200 OK` in 2.4–4.1 ms for four subscribers.
- Terminating calls routed S-CSCF → P-CSCF → UE using the stored Path; UE-to-UE call answered in 3.8 ms.
- Initial-filter-criteria rule sends service numbers to the Asterisk AS: 600 echo, 700 announcement.
- Negative checks: wrong password rejected, unknown subscriber `403`, unregistered callee `404`.

## VoIP QoS

A G.711 call runs over a 10 Mbit/s HTB trunk loaded with 12 Mbit/s of UDP (3 calls per case):

| Case | RTP loss | One-way delay | MOS | Call setup |
|---|---|---|---|---|
| Idle trunk | 0 % | 0.67 ms | 4.38 | 4.7 ms |
| Congested, single FIFO | 36.1 % | 56.3 ms | 1.83 | 211 ms |
| Congested, EF + CS3 priority class | 1.1 % | 1.4 ms | 4.27 | 5.6 ms |

## IPTV

A 2 Mbit/s H.264 channel to three set-top hosts: multicast with IGMP snooping halves the trunk that serves two viewers (8.56 → 4.28 MB), sends nothing to ports without viewers, and every received frame is bit-exact (375/375).

## Technologies

IMS, SIP, Kamailio, Asterisk (PJSIP), SIPp, VoIP, RTP, DiffServ / HTB, IPTV, Multicast / IGMP snooping, Mininet, Open vSwitch, FFmpeg, Python

## Links

- [GitHub repository — code, results & figures](https://github.com/Mahyoub88/ims-voip-iptv-volte-lab)
- [Portfolio project](https://mahyoub88.github.io/#proj-ims-voip-volte)
