#!/bin/bash

echo "🔍 Environment Variables Verification"
echo "====================================="

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "📦 Running inside Docker container"
    CONTAINER_NAME=$(hostname)
    echo "📦 Container: $CONTAINER_NAME"
else
    echo "💻 Running on host system"
fi

echo ""
echo "🔑 Critical Environment Variables:"
echo "- NODE_ENV: ${NODE_ENV:-'❌ NOT SET'}"
echo "- JWT_SECRET: ${JWT_SECRET:+✅ SET (${#JWT_SECRET} chars)} ${JWT_SECRET:-❌ NOT SET}"  
echo "- OPENAI_API_KEY: ${OPENAI_API_KEY:+✅ SET (starts with ${OPENAI_API_KEY:0:4}...)} ${OPENAI_API_KEY:-❌ NOT SET}"
echo "- DATABASE_URL: ${DATABASE_URL:+✅ SET} ${DATABASE_URL:-❌ NOT SET}"
echo "- CORS_ORIGIN: ${CORS_ORIGIN:-'❌ NOT SET'}"

echo ""
if [ -n "$OPENAI_API_KEY" ] && [ -n "$JWT_SECRET" ]; then
    echo "✅ All critical environment variables are set"
    exit 0
else
    echo "❌ Missing critical environment variables"
    exit 1
fi