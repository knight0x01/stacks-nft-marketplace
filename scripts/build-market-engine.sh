#!/bin/bash

echo "🔨 Building Market Engine Contract..."
echo ""

# Check if clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet not found. Please install it first."
    exit 1
fi

# Check the contract
echo "📋 Checking contract syntax..."
clarinet check contracts/market-engine.clar

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Market Engine contract is valid!"
    echo ""
    echo "📦 Contract: market-engine.clar"
    echo "📊 Size: $(wc -c < contracts/market-engine.clar) bytes"
    echo "📝 Lines: $(wc -l < contracts/market-engine.clar) lines"
    echo ""
    echo "Ready to deploy! Run:"
    echo "  node scripts/deploy-market-engine.js"
    exit 0
else
    echo ""
    echo "❌ Contract has errors. Please fix them before deploying."
    exit 1
fi
