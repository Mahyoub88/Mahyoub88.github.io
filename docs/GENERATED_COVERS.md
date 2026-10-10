# Illustrated project covers

Twenty distinct covers were created with the built-in image generation tool for the personal portfolio. Each visual represents the subject of its project and is identified as an AI-generated cover illustration. Generated interfaces, equipment arrangements, paths and chart motifs are illustrative; they are not recovered screenshots or measured results.

The canonical `coverImage`, `coverAlt` and `coverCaption` fields in `src/data/defaultContent.json` drive React cards, standalone indexes, collection indexes and case-study social previews. The separate `image`, `imageAlt` and `imageCaption` fields retain the documented evidence displayed inside each case study.

Final assets are versioned under `public/images/project-covers/generated-v2/`, encoded as 1280 × 720 WebP, and loaded lazily on cards. The project validator checks distinct paths and SHA-256 hashes, descriptive alternatives, provenance captions and file existence. Original source assets and previous covers remain available.
