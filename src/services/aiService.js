const axios = require('axios');

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.localAIUrl = process.env.LOCALAI_URL || 'http://localhost:8080';
    this.flowiseUrl = process.env.FLOWISE_URL || 'http://localhost:3000';
  }

  // Generate text using AI
  async generateText(prompt, options = {}) {
    const {
      model = process.env.DEFAULT_AI_MODEL || 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 2000,
      systemMessage = 'You are a professional content writer and researcher.'
    } = options;

    try {
      if (this.openaiKey) {
        return await this.generateWithOpenAI(prompt, systemMessage, model, temperature, maxTokens);
      } else {
        return await this.generateWithLocalAI(prompt, systemMessage, model, temperature, maxTokens);
      }
    } catch (error) {
      console.error('Error generating text:', error.message);
      throw error;
    }
  }

  async generateWithOpenAI(prompt, systemMessage, model, temperature, maxTokens) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }

  async generateWithLocalAI(prompt, systemMessage, model, temperature, maxTokens) {
    const response = await axios.post(
      `${this.localAIUrl}/v1/chat/completions`,
      {
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      }
    );
    return response.data.choices[0].message.content;
  }

  // Generate article content
  async generateArticle(topic, researchData, tags = []) {
    const prompt = `Write a comprehensive, well-structured blog article about: ${topic}

Tags: ${tags.join(', ')}

Research Data:
${researchData.map((r, i) => `${i + 1}. ${r.title || r.content.substring(0, 200)}`).join('\n')}

Requirements:
- Write an engaging introduction
- Create well-organized sections with headers
- Include relevant facts and insights from the research
- Use a professional yet accessible tone
- Add a compelling conclusion
- Format in Markdown
- Aim for 1000-1500 words

Article:`;

    return await this.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 3000,
      systemMessage: 'You are an expert content writer who creates engaging, informative blog articles based on research data.'
    });
  }

  // Summarize content
  async summarize(content, maxLength = 200) {
    const prompt = `Summarize the following content in ${maxLength} words or less:\n\n${content}`;
    
    return await this.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 500,
      systemMessage: 'You are a skilled summarizer who creates concise, informative summaries.'
    });
  }

  // Extract key points
  async extractKeyPoints(content) {
    const prompt = `Extract 5-7 key points from the following content:\n\n${content}\n\nProvide the key points as a numbered list.`;
    
    return await this.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 500,
      systemMessage: 'You are an expert at identifying and extracting key information.'
    });
  }

  // Generate tags
  async generateTags(content, maxTags = 10) {
    const prompt = `Generate relevant tags/keywords for the following content (maximum ${maxTags} tags):\n\n${content}\n\nProvide tags as a comma-separated list.`;
    
    const response = await this.generateText(prompt, {
      temperature: 0.3,
      maxTokens: 200,
      systemMessage: 'You are an expert at identifying relevant tags and keywords.'
    });
    
    return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
}

module.exports = new AIService();
