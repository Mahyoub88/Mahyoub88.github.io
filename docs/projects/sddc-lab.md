# Software-Defined Data Center (SDDC) — Design & Implementation

**Author:** Mohammed Mahyoub.

Designed and implemented a working software-defined data center on physical hardware, virtualising compute, storage and networking and hosting directory, cloud-application, web and e-mail services.

## Scope

Independent project covering design, implementation, configuration, testing and technical documentation, alongside a study of SDDC architecture, storage networking (DAS/NAS/SAN, FC, IP SAN), network virtualisation and cloud models.

## Storage

FreeNAS 11 on a dedicated server: ZFS volumes exported over iSCSI (portal, authorised initiators, CHAP authentication, target–extent LUN mapping) and attached to ESXi as shared storage.

## Compute

VMware ESXi 5.5 host managed with vSphere Client, running Windows Server 2008 R2 virtual machines with planned CPU, memory and thick/thin disk provisioning.

## Network

ESXi standard vSwitch with network labels and optional VLAN IDs, plus NIC teaming (active/standby), on a switched LAN with Wi-Fi access.

## Services

AD/DNS/DHCP domain controller; Citrix XenApp 6.5 farm publishing applications to domain users via Citrix Receiver; AppServ web stack (Apache, PHP, MySQL); Exchange 2013 with OWA/ECP, PowerShell mailbox provisioning, groups, connectors and transport rules.

## Technologies

VMware ESXi, vSphere, FreeNAS / ZFS, iSCSI, vSwitch, Active Directory, Citrix XenApp, Exchange 2013, Windows Server, Apache / PHP / MySQL

## Links

- [Portfolio project](https://mahyoub88.github.io/#proj-sddc-lab)
- [View GitHub Repository](https://github.com/Mahyoub88/sddc-lab-implementation)
