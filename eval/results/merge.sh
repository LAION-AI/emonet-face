#!/bin/bash

# Hardcoded output file
OUTPUT_FILE="affectnet.jsonl"

# List of input parts in order
INPUT_FILES=("affectnet1.jsonl" "affectnet2.jsonl" "affectnet3.jsonl" "affectnet4.jsonl")

# Check that all input files exist
for f in "${INPUT_FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "File $f does not exist."
        exit 1
    fi
done

# Merge all parts
cat "${INPUT_FILES[@]}" > "$OUTPUT_FILE"

echo "Merged files into $OUTPUT_FILE"
