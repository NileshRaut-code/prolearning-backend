curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
     -H "Authorization: Bearer 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"  \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Generate the list of question of matrix topic of 10"}], "model": "llama3-8b-8192"}'
