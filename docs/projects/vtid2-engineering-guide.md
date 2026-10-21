# Efficient Neural Network Architectures for Vehicle Type Classification — Engineering Guide

Developed and evaluated neural network architectures for vehicle type classification using the VTID2 image dataset. The evaluated architectures included an MLP, a standard CNN, an efficient depthwise-separable CNN, and an efficient CNN with Squeeze-and-Excitation.

## Visual overview

![Functional overview](vtid2-assets/architecture.svg)

*New explanatory diagram; grouped responsibilities, not an as-built schematic or test result.*

![Engineering workflow](vtid2-assets/workflow.svg)

*New explanatory workflow; a documentation aid, not evidence that every proposed check was performed.*

## Data quality before accuracy

The content audit found 4,356 valid images, of which 2,425 were redundant exact copies. The remaining 1,931 exact-unique images make clear why evaluation design matters: copies can cross an image-level train/test boundary and inflate apparent generalisation.

## Architecture comparison

The MLP establishes a non-convolutional baseline. A standard CNN is compared with a depthwise-separable CNN and a version with Squeeze-and-Excitation. The comparison considers Macro-F1 together with trainable parameters, multiply-accumulate operations and batch-one inference latency.

## Interpretation of published results

The public LinkedIn summary reports 87.24% fewer parameters and 81.67% fewer MACs for the efficient CNN, with a mean Macro-F1 difference of 0.0150. Conventional and controlled protocols also differ in data composition and training settings; their performance gap is a diagnostic comparison, not a causal estimate of leakage.

## Explainability and access

Grad-CAM investigates attention to vehicle regions and preprocessing padding. Padding attention stayed below the geometric null; however, padding geometry itself encodes aspect ratio, so it is not a fully neutral artefact. The notebook and source code are public in the [project repository](https://github.com/Mahyoub88/VTID2-Efficient-Vehicle-Type-Classification); the VTID2 dataset itself is not redistributed.

## Evidence to review or collect

The following are suggested review checks. A checklist entry is not a claimed pass result.

- Duplicate audit and split identity checks.
- Model/protocol configuration.
- Classwise results and uncertainty.
- Latency environment and Grad-CAM examples.

## Sources and provenance

- [Published portfolio description](https://mahyoub88.github.io/#proj-vtid2).
- [Public repository and executed notebook](https://github.com/Mahyoub88/VTID2-Efficient-Vehicle-Type-Classification).
- [Author ORCID](https://orcid.org/0009-0003-5640-352X).
- [LinkedIn projects](https://www.linkedin.com/in/mohammed-mahyoub/details/projects/): supplementary descriptions and project media.
- New SVG figures and explanatory text were authored for this documentation update; they are not original photographs or new measured results.
- Executed-notebook figures are published in the repository engineering guide; the new diagrams provide explanation without substituting for that evidence.
