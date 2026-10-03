# Autonomous Quadcopter UAV — Flight Control, Telemetry & FPV

**Author:** Mohammed Mahyoub.

Designed, assembled and flight-tested an autonomous quadcopter with GPS waypoint navigation, MAVLink telemetry to a ground control station, failsafe protection, and a live 5.8 GHz video link for remote surveillance.

## Scope

Independent project covering propulsion sizing, airframe and electronics integration, sensor calibration, PID tuning, flight-mode and failsafe testing, telemetry and video systems, and technical documentation.

## Build

DJI F450 frame, 4× DJI 2212/920KV motors with 30A ESCs, 3S LiPo, APM 2.6 (MPU6000 IMU, barometer), uBlox NEO-6M GPS/compass, sonar and optical-flow sensors, 3DR 433 MHz telemetry (≈400 m range tested), 2.4 GHz RC via PPM encoder, 5.8 GHz video with MinimOSD. Propulsion sized in eCalc (≈1.6 kg all-up weight).

## Testing

Calibrated accelerometer, compass, RC and ESCs; tuned stabilize PIDs; flight-tested Stabilize, Loiter, AltHold, Auto (waypoints), Guided and Follow-Me (phone GCS), plus radio and geofence failsafes (land / return-to-launch).

## Fixes

Root-caused faults from flight logs: re-centred an off-centre IMU causing drift; damped vibration and shielded the barometer for Loiter; low-pass filtered sonar for AltHold; moved the compass away from ≈80% motor interference and set local magnetic declination (2.11°E) to correct Auto-mode heading.

## Study

Backed by a UAS communications study: command-and-control and telemetry links (GSM/GPRS, line-of-sight 900 MHz–5.8 GHz) and UAS spectrum requirements (ITU-R M.2171).

## Technologies

ArduPilot, APM 2.6, MAVLink, Mission Planner, PID Tuning, GPS Navigation, Telemetry, FPV Video, Sensor Calibration, Failsafe

## Links

- [Portfolio project](https://mahyoub88.github.io/#proj-quadcopter-uav)
- [View GitHub Repository](https://github.com/Mahyoub88/autonomous-quadcopter-uav)
