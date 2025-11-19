#!/bin/bash

# Generate Architecture Diagrams from Mermaid Source Files
# This script converts all .mmd files in docs/mermaid/ to PNG images

set -e  # Exit on error

echo "======================================"
echo "Architecture Diagram Generator"
echo "======================================"
echo ""

# Check if Mermaid CLI is installed
if ! command -v mmdc &> /dev/null; then
    echo "❌ Error: Mermaid CLI (mmdc) is not installed."
    echo ""
    echo "To install, run:"
    echo "  npm install -g @mermaid-js/mermaid-cli"
    echo ""
    echo "Or use npx (no installation required):"
    echo "  Replace 'mmdc' with 'npx -p @mermaid-js/mermaid-cli mmdc' in this script"
    exit 1
fi

echo "✅ Mermaid CLI found: $(which mmdc)"
echo ""

# Create output directory
OUTPUT_DIR="docs/images"
mkdir -p "$OUTPUT_DIR"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Configuration
THEME="dark"
BACKGROUND="transparent"
WIDTH="1920"
HEIGHT="1080"

echo "⚙️  Configuration:"
echo "   Theme: $THEME"
echo "   Background: $BACKGROUND"
echo "   Resolution: ${WIDTH}x${HEIGHT}"
echo ""

# Counter for generated files
count=0
errors=0

echo "======================================"
echo "Generating diagrams..."
echo "======================================"
echo ""

# Process all .mmd files
for mmd_file in docs/mermaid/*.mmd; do
    if [ -f "$mmd_file" ]; then
        # Get filename without path and extension
        filename=$(basename "$mmd_file" .mmd)
        output_file="$OUTPUT_DIR/$filename.png"

        echo "📊 Processing: $filename"
        echo "   Input:  $mmd_file"
        echo "   Output: $output_file"

        # Generate PNG
        if mmdc -i "$mmd_file" -o "$output_file" -t "$THEME" -b "$BACKGROUND" -w "$WIDTH" -H "$HEIGHT"; then
            echo "   ✅ Generated successfully"
            ((count++))
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
    echo "To view the diagrams:"
    echo "  open $OUTPUT_DIR/"
    echo ""
    echo "To use in documentation:"
    echo "  ![Architecture](docs/images/01-overall-architecture.png)"
fi

echo ""
echo "======================================"
echo "Done!"
echo "======================================"
