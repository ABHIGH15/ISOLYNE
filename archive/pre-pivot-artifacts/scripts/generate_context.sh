#!/bin/bash
OUTPUT="SquadRadar_Context.txt"
> $OUTPUT

add_file() {
    if [ -f "$1" ]; then
        echo -e "\n\n================================================================" >> $OUTPUT
        echo "FILE: $1" >> $OUTPUT
        echo "================================================================" >> $OUTPUT
        cat "$1" >> $OUTPUT
    fi
}

echo "Generating single context file..."

# Add docs
add_file "docs/current-state.md"
add_file "docs/awareness-engine-v1.0.md"
add_file "docs/shared-reality-gap-taxonomy-v1.0.md"
add_file "docs/collaboration-intelligence-system-architecture-v1.0.md"
add_file "docs/collaboration-intelligence-domain-model-v1.0.md"
add_file "docs/ci-kernel-v0.1-specification.md"
add_file "docs/ci-kernel-persistence-specification-v1.0.md"

# Add Kernel code
find src/kernel -type f -name "*.ts" | while read -r file; do
    add_file "$file"
done

echo "Context file generated: $OUTPUT"
