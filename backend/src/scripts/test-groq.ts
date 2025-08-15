import 'dotenv/config';
import OpenAI from 'openai';

// Initialize OpenAI client with Groq API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function testGroqIntegration() {
  try {
    console.log('🧪 Testing Groq API integration...');

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps extract search intent and key entities from user queries.
          Your task is to analyze the query and identify:
          1. The main intent (e.g., finding people, projects, challenges, partnerships)
          2. Key entities mentioned (names, skills, industries, etc.)
          3. Any implied filters (e.g., status, type, role)
          
          Format your response as JSON with the following structure:
          {
            "intent": "string describing the primary search intent",
            "entities": ["array of key entities extracted"],
            "filters": {"field": "value"} - any implied filters,
            "expandedQuery": "an expanded version of the query that might catch more relevant results"
          }`,
        },
        {
          role: 'user',
          content: 'Looking for AI startup founders in fintech',
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (content) {
      const parsed = JSON.parse(content);
      console.log('✅ Groq API test successful!');
      console.log('📊 Response:', JSON.stringify(parsed, null, 2));

      // Verify the expected structure
      if (parsed.intent && parsed.entities && parsed.filters && parsed.expandedQuery) {
        console.log('✅ JSON response structure is correct');
        return true;
      } else {
        console.log('❌ JSON response structure is incorrect');
        return false;
      }
    } else {
      console.log('❌ Empty response from Groq API');
      return false;
    }
  } catch (error) {
    console.error('❌ Groq API test failed:', error);
    return false;
  }
}

// Run the test
testGroqIntegration().then(success => {
  if (success) {
    console.log('🎉 Groq integration is working correctly!');
    process.exit(0);
  } else {
    console.log('💥 Groq integration test failed');
    process.exit(1);
  }
});
