# Efficient Neural Network Architectures for Vehicle Type Classification

**Author:** Mohammed Mahyoub.

Developed and evaluated neural network architectures for vehicle type classification using the VTID2 image dataset. The evaluated architectures included an MLP, a standard CNN, an efficient depthwise-separable CNN, and an efficient CNN with Squeeze-and-Excitation.

## Problem

A content-based dataset audit identified 2,425 redundant exact copies among 4,356 valid images, leaving 1,931 exact-unique images.

## Method

Compared conventional and leakage-controlled evaluation protocols, and examined the trade-off between classification performance and computational efficiency.

## Result

The efficient CNN achieved substantial reductions in trainable parameters and MACs while maintaining competitive Macro-F1. Grad-CAM was used to analyse model attention and the influence of preprocessing and letterbox padding.

## Technologies

PyTorch, CNN, Efficient AI, Grad-CAM, Model Evaluation, Data Quality

## Links

- [Portfolio project](https://mahyoub88.github.io/#proj-vtid2)

## Illustrated engineering guide

[Read the public illustrated guide](vtid2-engineering-guide.md) · [Web case study](https://mahyoub88.github.io/projects/proj-vtid2/)

The private assessment repository and code remain private.
