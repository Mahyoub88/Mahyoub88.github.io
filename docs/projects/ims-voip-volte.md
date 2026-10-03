# IMS Multimedia Services — VoIP, IPTV & VoLTE

IP multimedia services built around an IP Multimedia Subsystem (IMS) core, in two parts:

- **Part A, the team project:** VoIP on Cisco Unified Communications, IPTV streaming and VoLTE simulated in OPNET, plus an IMS case study for a fixed-line and a mobile operator.
- **Part B, a reproducible open-source lab:** the same service areas rebuilt and measured with Kamailio, Asterisk and Mininet.

## Role

Implementation and technical supervision of the team project. Design, implementation, testing and documentation of the reproducible lab.

## Part A — Project implementation

### VoIP: Cisco Unified Communications

- **Call control:** CUCM 8.6 on VMware.
- **Voice network:** a three-router GNS3 network:
  - HQ voice gateway (H.323 toward CUCM);
  - branch router running Cisco Unified CME;
  - PSTN-side router.
- **Gateway configuration:**
  - VoIP dial-peers for each number range;
  - G.711 codec class;
  - H.323 timers;
  - DTMF relay over H.245;
  - H.323↔SIP interworking.
- **Branch survivability:** CME keeps internal calling at the branch if the WAN to CUCM fails.
- **CUCM services:**
  - NTP and Date/Time Groups;
  - TFTP phone provisioning;
  - Extension Mobility with device profiles.
- **Endpoints:** Cisco IP Communicator (SCCP), X-Lite and Media5-fone on Android (SIP).
- **Result:** calls completed end-to-end between CUCM, branch and PSTN phones.

### IPTV

VLC streamed over the LAN (HTTP and UDP), with optional transcoding. Laptops and mobile phones watched the channel.

### VoLTE: OPNET Modeler 14.5

- **Access network:** an LTE-like network built from the 802.16e model:
  - 4 cells;
  - OFDMA 20 MHz;
  - STC 2×1 MIMO;
  - "Gold" UGS QoS class for voice.
- **Core:** IMS core (P-CSCF, I-CSCF, S-CSCF, HSS) connected to the PSTN.
- **Mobility:** a mobile UE handed over across the cells.
- **Measured:** voice traffic, jitter, delay and throughput. PSTN phones sent and received voice through the IMS core.

### Case study

Three ways for a fixed-line operator (PTC) and a mobile operator (Yemen Mobile) to adopt IMS:

1. **NGN → IMS upgrade.**
2. **Converged core:**
   - HSS/SLF, SBC and PCRF options;
   - single EPC with eNodeB upgrade.
3. **Two new IMS cores.**

## Part B — Reproducible lab

### IMS core

- **Elements:** Kamailio as P-CSCF and S-CSCF, Asterisk as the application server.
- **Registration:** HTTP-digest registration in 2.4–4.1 ms; calls routed via Path.
- **Service numbers:** an initial-filter-criteria rule sends 600 (echo) and 700 (announcement) to the AS.
- **Negative checks:**
  - wrong password rejected;
  - unknown subscriber gets `403`;
  - unregistered callee gets `404`.

### VoIP QoS

A G.711 call runs over a 10 Mbit/s trunk loaded with 12 Mbit/s of UDP:

| Case | RTP loss | One-way delay | MOS | Call setup |
|---|---|---|---|---|
| Idle trunk | 0 % | 0.67 ms | 4.38 | 4.7 ms |
| Congested, single FIFO | 36.1 % | 56.3 ms | 1.83 | 211 ms |
| Congested, EF + CS3 priority class | 1.1 % | 1.4 ms | 4.27 | 5.6 ms |

### IPTV

Multicast with IGMP snooping:

- halves the trunk serving two viewers (8.56 → 4.28 MB);
- sends nothing to ports without viewers;
- delivers bit-exact frames (375/375).

## Credits

- **Project report:** Kholoud Saleh Hazzam, Anwaar Ahmed Al-Hamdani, Najla Abdulkhaleq Al-Zubairi and Leena Abdulbaset Al-Huribi. Electrical Engineering Department, Faculty of Engineering, Sana'a University.
- **Academic supervisor:** Dr. Ali Naji Nosary.
- **Implementation and technical supervision:** Mohammed Mahyoub.

## Technologies

IMS, SIP, H.323, Cisco CUCM, Cisco CME, GNS3, VMware, VLC, OPNET Modeler, VoLTE, Kamailio, Asterisk, SIPp, DiffServ, IPTV multicast / IGMP snooping, Mininet, Open vSwitch, FFmpeg, Python

## Links

- [GitHub repository: screenshots, Cisco configs, lab code and results](https://github.com/Mahyoub88/ims-voip-iptv-volte-lab)
- [Portfolio project](https://mahyoub88.github.io/#proj-ims-voip-volte)
