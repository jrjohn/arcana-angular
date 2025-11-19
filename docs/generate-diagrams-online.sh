#!/bin/bash

# Generate Architecture Diagrams using Mermaid.ink API
# This script converts .mmd files to PNG using the online Mermaid service

set -e

echo "======================================"
echo "Online Mermaid Diagram Generator"
echo "======================================"
echo ""

OUTPUT_DIR="docs/diagrams"
mkdir -p "$OUTPUT_DIR"

echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Counter
count=0
errors=0

echo "======================================"
echo "Generating diagrams..."
echo "======================================"
echo ""

# Function to encode content for URL
urlencode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c"
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Process each .mmd file
for mmd_file in docs/mermaid/*.mmd; do
    if [ -f "$mmd_file" ]; then
        filename=$(basename "$mmd_file" .mmd)
        output_file="$OUTPUT_DIR/$filename.png"

        echo "📊 Processing: $filename"
        echo "   Input:  $mmd_file"
        echo "   Output: $output_file"

        # Read mermaid content
        mermaid_content=$(cat "$mmd_file")

        # Encode for base64
        encoded=$(echo "$mermaid_content" | base64)

        # Use mermaid.ink API to generate PNG
        url="https://mermaid.ink/img/${encoded}?type=png"

        if curl -s -o "$output_file" "$url"; then
            # Check if file was created and has content
            if [ -s "$output_file" ]; then
                echo "   ✅ Generated successfully"
                ((count++))
            else
                echo "   ❌ Failed - empty file"
                rm -f "$output_file"
                ((errors++))
            fi
        else
            echo "   ❌ Failed to download"
            ((errors++))
        fi
        echo ""
    fi
done

echo "======================================"
echo "Summary"
echo "======================================"
echo "✅ Successfully generated: $count diagrams"
if [ $errors -gt 0 ]; then
    echo "❌ Failed: $errors diagrams"
fi
echo ""

if [ $count -gt 0 ]; then
    echo "📂 Generated files are in: $OUTPUT_DIR/"
    echo ""
    echo "Files created:"
    ls -lh "$OUTPUT_DIR/"*.png 2>/dev/null || echo "No PNG files found"
fi

echo ""
echo "======================================"
echo "Done!"
echo "======================================"
