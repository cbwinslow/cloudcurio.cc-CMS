const { getQdrantClient } = require('../config/qdrant');
const { v4: uuidv4 } = require('uuid');

class VectorService {
  constructor() {
    this.client = getQdrantClient();
  }

  // Generate embeddings using OpenAI or LocalAI
  async generateEmbedding(text) {
    try {
      // Use OpenAI API if available, otherwise use LocalAI
      const axios = require('axios');
      
      if (process.env.OPENAI_API_KEY) {
        const response = await axios.post(
          'https://api.openai.com/v1/embeddings',
          {
            input: text,
            model: 'text-embedding-ada-002'
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data.data[0].embedding;
      } else {
        // Use LocalAI as fallback
        const response = await axios.post(
          `${process.env.LOCALAI_URL}/embeddings`,
          {
            input: text,
            model: 'all-MiniLM-L6-v2'
          }
        );
        return response.data.data[0].embedding;
      }
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      // Return dummy embedding for testing
      return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    }
  }

  // Store vector in Qdrant
  async storeVector(collectionName, id, vector, payload) {
    try {
      await this.client.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: id || uuidv4(),
            vector: vector,
            payload: payload
          }
        ]
      });
      return id;
    } catch (error) {
      console.error('Error storing vector:', error.message);
      throw error;
    }
  }

  // Search similar vectors
  async searchSimilar(collectionName, queryVector, limit = 10) {
    try {
      const results = await this.client.search(collectionName, {
        vector: queryVector,
        limit: limit,
        with_payload: true
      });
      return results;
    } catch (error) {
      console.error('Error searching vectors:', error.message);
      return [];
    }
  }

  // Delete vector
  async deleteVector(collectionName, id) {
    try {
      await this.client.delete(collectionName, {
        wait: true,
        points: [id]
      });
      return true;
    } catch (error) {
      console.error('Error deleting vector:', error.message);
      return false;
    }
  }
}

module.exports = new VectorService();
