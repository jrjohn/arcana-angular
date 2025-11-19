#!/bin/bash

# Generate Large, High-Resolution Architecture Diagrams using Mermaid CLI
# This script converts .mmd files to PNG at a much larger size for clarity

set -e

echo "======================================"
echo "High-Resolution Mermaid Diagram Generator"
echo "======================================"
echo ""

OUTPUT_DIR="docs/diagrams"
mkdir -p "$OUTPUT_DIR"

echo "📁 Output directory: $OUTPUT_DIR"
echo "🎨 Resolution: 2400px width (3x larger than default)"
echo "🎨 Scale: 3x for crisp rendering"
echo ""

# Counter
count=0
errors=0

echo "======================================"
echo "Generating diagrams..."
echo "======================================"
echo ""

# Process each .mmd file
for mmd_file in docs/mermaid/*.mmd; do
    if [ -f "$mmd_file" ]; then
        filename=$(basename "$mmd_file" .mmd)
        output_file="$OUTPUT_DIR/$filename.png"

        echo "📊 Processing: $filename"
        echo "   Input:  $mmd_file"
        echo "   Output: $output_file"

        # Generate PNG with high resolution
        # -w 2400: Width of 2400px (3x larger than default 800px)
        # -s 3: Scale factor of 3 for crisp rendering
        # -b transparent: Transparent background
        if mmdc -i "$mmd_file" -o "$output_file" -w 2400 -s 3 -b transparent 2>&1; then
            # Check if file was created and has content
            if [ -s "$output_file" ]; then
                file_size=$(du -h "$output_file" | cut -f1)
                echo "   ✅ Generated successfully (size: $file_size)"
                ((count++))
            else
                echo "   ❌ Failed - empty file"
                rm -f "$output_file"
                ((errors++))
            fi
        else
            echo "   ❌ Failed to generate"
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
    ls -lh "$OUTPUT_DIR/"*.png 2>/dev/null | awk '{print "   " $9 " - " $5}'
    echo ""
    total_size=$(du -sh "$OUTPUT_DIR" | cut -f1)
    echo "📦 Total size: $total_size"
fi

echo ""
echo "======================================"
echo "Done!"
echo "======================================"
