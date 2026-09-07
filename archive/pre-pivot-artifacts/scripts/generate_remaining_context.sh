#!/bin/bash
OUTPUT="SquadRadar_Remaining_Context.txt"
> $OUTPUT

add_file() {
    if [ -f "$1" ]; then
        echo -e "\n\n================================================================" >> $OUTPUT
        echo "FILE: $1" >> $OUTPUT
        echo "================================================================" >> $OUTPUT
        cat "$1" >> $OUTPUT
    fi
}

echo "Generating remaining context file..."

# Add Experiments
for file in docs/Experiment_*.md; do
    add_file "$file"
done

# Add Old Runtime code
find src/runtime -type f -name "*.ts" | while read -r file; do
    add_file "$file"
done

# Add App/UI code
if [ -d "app" ]; then
    find app -type f -name "*.tsx" -o -name "*.ts" | while read -r file; do
        add_file "$file"
    done
fi

echo "Remaining context file generated: $OUTPUT"
