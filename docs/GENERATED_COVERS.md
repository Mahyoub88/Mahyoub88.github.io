# Illustrated project covers

Twenty distinct covers were created with the built-in image generation tool for the personal portfolio. Each visual represents the subject of its project and is identified as an AI-generated cover illustration. Generated interfaces, equipment arrangements, paths and chart motifs are illustrative; they are not recovered screenshots or measured results.

The canonical `coverImage`, `coverAlt` and `coverCaption` fields in `src/data/defaultContent.json` drive React cards, standalone indexes, collection indexes and case-study social previews. The separate `image`, `imageAlt` and `imageCaption` fields retain the documented evidence displayed inside each case study.

Current assets are versioned under `public/images/project-covers/engineering-v3/`, encoded as 1280 × 720 WebP, and loaded lazily on cards. The project validator checks distinct paths and SHA-256 hashes, descriptive alternatives, provenance captions and file existence. Original source assets and previous covers remain available.

The engineering edition uses light backgrounds, high-contrast project-type headings, component callouts and functional paths. Subjects follow the canonical documentation: concrete batching for PLC, internal PIC EEPROM persistence, image-based CNN classification versus trajectory-based tabular machine learning, and distinct control/data planes for SDN. These covers explain project types without claiming exact installation layouts or measured results.
