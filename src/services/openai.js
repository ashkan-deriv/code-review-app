import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function reviewCode(files) {
  const reviews = [];

  for (const file of files) {
    try {
      const prompt = `Review this code for potential issues, bugs, and improvements. Consider:
1. Code quality and best practices
2. Potential bugs or security issues
3. Performance considerations
4. Maintainability and readability
5. Suggested improvements

Code to review:
${file.content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer. Provide clear, actionable feedback focusing on important issues. Format your response as a list of specific findings with line numbers where applicable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      reviews.push({
        file: file.name,
        review: response.choices[0].message.content,
        path: file.path
      });
    } catch (error) {
      console.error(`Error reviewing ${file.name}:`, error);
      reviews.push({
        file: file.name,
        review: "Error occurred during review",
        path: file.path,
        error: error.message
      });
    }
  }

  return reviews;
}
