find src -type f | sort | while read -r file; do
    echo "============================================================"
    echo "FILE: $file"
    echo "============================================================"
    cat "$file"
    echo
    echo
done
