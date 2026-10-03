# IMS Multimedia Services — VoIP, IPTV & VoLTE

Built and tested an end-to-end IP multimedia environment covering enterprise VoIP, IPTV streaming, and Voice over LTE, and studied how an IMS core could interconnect a fixed-line operator and a mobile operator.

## Role

Worked across all workstreams of a team project: VoIP / Cisco UC deployment, VoLTE performance analysis, IPTV streaming, the operator-integration study, and technical documentation.

## VoIP

Deployed Cisco Unified Communications Manager 8.6 on VMware and a three-router GNS3 topology (voice gateway, branch, PSTN). Configured POTS/VoIP dial-peers, G.711 codec classes, H.323/SIP interworking, a branch CME for WAN survivability, NTP and date/time groups, SCCP and SIP softphones (incl. Android), and Extension Mobility.

## VoLTE

Modelled an LTE-like access network in OPNET Modeler 14.5 (4 cells, OFDMA, FDD, 2×1 MIMO, UGS 'Gold' QoS class for interactive voice) connected to an IMS core (P/I/S-CSCF, HSS) and a PSTN segment, then analysed handover behaviour, jitter, packet-delay variation, delay, and throughput for a mobile user.

## Result

VoIP calls completed with low delay and good voice quality; in the VoLTE model jitter stayed near zero and access delay low, with voice-traffic dips aligned to cell handovers. IPTV was streamed over the LAN with VLC to laptops and phones.

## Study

Compared three IMS integration scenarios between a fixed-line and a mobile operator: NGN-to-IMS upgrade, a converged core (shared HSS/SLF, SBC, PCRF, single EPC with eNodeB upgrade), and two new IMS cores.

## Technologies

IMS, SIP, VoIP, Cisco CUCM, CME, H.323, GNS3, VoLTE, LTE / EPC, OPNET, IPTV, QoS

## Links

- [Portfolio project](https://mahyoub88.github.io/#proj-ims-voip-volte)
- [View GitHub Repository](https://github.com/Mahyoub88/ims-voip-iptv-volte-lab)
