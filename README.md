# Arsenal Generator

A utility for managing and generating ACE3 Arsenal configuration files for Arma 3 mods.

## Description

This tool helps with:

- Combining multiple JSON item lists into a single arsenal configuration
- Generating proper SQF format initialization scripts
- Removing duplicates and validating arsenal contents
- Extracting class names from mod configuration files

## Installation

```bash
bun install
```

## Usage

### Generate Arsenal Files

Combines JSON files from a specified folder into arsenal configuration files:

```bash
bun run arsenal --folder path/to/json/folder
```

Options:

- `--folder`, `-f`: (Required) Path to folder containing JSON files
- `--no-check`: Skip duplicate checking

Output files will be created in the `output` directory:

- `init_arsenal_[foldername].sqf`: For direct initialization
- `arsenal_[foldername].sqf`: For execution with parameters

### Extract Class Names

Extract class names from an Arma 3 mod's config.cpp file:

```bash
bun run extract path/to/config.cpp
```

The extracted class names will be output in JSON format.

## Project Structure

- `generate_arsenal.ts`: Main script for generating arsenal configurations
- `extract_config.ts`: Utility for extracting class names from config files

## Notes

This tool is designed for use with ACE3 Arsenal in Arma 3, helping with the creation and management of custom arsenal boxes.