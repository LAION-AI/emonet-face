<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** Reference style links for badges.
*** See the bottom of this document for the declaration of the reference variables.
-->
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="public/emonet-face.svg" alt="EmoNet-Face Logo" width="120" />
  <h3 align="center">EmoNet-Face</h3>
  <p align="center">
    An Expert-Annotated Benchmark for Synthetic Emotion Recognition
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://huggingface.co/datasets/laion/emonet-face-hq">Dataset HQ</a>
    &middot;
    <a href="https://huggingface.co/datasets/laion/emonet-face-binary">Dataset Binary</a>
    &middot;
    <a href="https://huggingface.co/datasets/laion/emonet-face-big">Dataset Big</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#contents">Contents</a></li>
    <li><a href="#datasets">Datasets</a></li>
    <li><a href="#pretrained-models">Pretrained Models</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#citation">Citation</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

## About The Project

Effective human-AI interaction relies on AI's ability to accurately perceive and interpret human emotions. However, current benchmarks for vision and vision-language models are severely limited: they offer a narrow emotional spectrum, overlook nuanced states (e.g., bitterness, intoxication), and fail to distinguish subtle differences between related feelings (e.g., shame vs. embarrassment). Existing datasets often use uncontrolled imagery with occluded faces and lack demographic diversity, risking significant bias.

**EmoNet-Face** addresses these critical gaps with a comprehensive benchmark suite featuring:
- A novel 40-category emotion taxonomy, meticulously derived from foundational research to capture finer details of human emotional experiences.
- Three large-scale, AI-generated datasets with explicit, full-face expressions and controlled demographic balance across ethnicity, age, and gender.
- Rigorous, multi-expert annotations for both training and high-fidelity evaluation.
- The Empathic Insight Face model, achieving human-expert-level performance on our benchmark.

The publicly released EmoNet-Face suite—taxonomy, datasets, and model—provides a robust foundation for developing and evaluating AI systems with a deeper understanding of human emotions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contents

- **data/**
  - `binary.csv`: Dataset file (without images) for binary emotion analysis.
  - `hq.csv`: High-quality dataset file (without images) for analysis.
  - `guide.json`: Guide or metadata for the datasets.
- **inference/**
  - `vlm-inference-prompt-multi-shot.ipynb`: Notebook for multi-shot VLM inference.
  - `vlm-inference-prompt-zero-shot.ipynb`: Notebook for zero-shot VLM inference.
- **statistics/**
  - `analysis-binary.ipynb`: Analysis notebook for the binary dataset.
  - `analysis-hq.ipynb`: Analysis notebook for the high-quality dataset.
  - `descriptive.ipynb`: Descriptive statistics notebook.
  - `worldmap.ipynb`: Notebook for world map visualizations.
- **README.md**: This file.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Datasets

The datasets for this project are hosted on Hugging Face and are designed to address the limitations of prior work by providing explicit, full-face expressions and balanced demographic representation:

- **[EmoNet-Face HQ](https://huggingface.co/datasets/laion/emonet-face-hq):** 2,500 expert-annotated images covering 40 emotion categories (test set), with rigorous multi-expert annotation and demographic control.
- **[EmoNet-Face Binary](https://huggingface.co/datasets/laion/emonet-face-binary):** 19,999 images with binary expert annotations (for fine-tuning), also demographically balanced.
- **[EmoNet-Face Big](https://huggingface.co/datasets/laion/emonet-face-big):** Over 400,000 images with weak emotion labels (training set), generated with explicit, full-face expressions and demographic diversity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Pretrained Models

We provide two self-trained inference models for emotion recognition, collectively referred to as Empathic Insight Face. These models achieve human-expert-level performance on the EmoNet-Face benchmark:

- **Empathic Insight Face Small**  
  [Colab Notebook](https://colab.research.google.com/drive/1aLkBFncxBEdC2y0OcXbISd98Dc5MFq29?usp=sharing)

- **Empathic Insight Face Large**  
  [Colab Notebook](https://colab.research.google.com/drive/11oUMo2HX0OuD9dx5ZM4ltNvoYxbI65hu?usp=sharing)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

- **Code:** MIT License
- **Datasets:** Creative Commons Attribution 4.0 International (CC BY 4.0)

See [`LICENSE`](LICENSE) for details.

[![MIT License][license-shield]][license-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Citation

If you use this repository or models, please cite our paper:

```
@inproceedings{emoface2025,
  title={EmoNet-Face: An Expert-Annotated Benchmark for Synthetic Emotion Recognition},
  year={2025},
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgements

TBA

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge
[license-url]: https://opensource.org/licenses/MIT
