const { QdrantClient } = require('@qdrant/js-client-rest');

let qdrantClient = null;

const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
  }
  return qdrantClient;
};

const initializeQdrantCollections = async () => {
  const client = getQdrantClient();
  
  const collections = [
    {
      name: 'articles',
      vectorSize: 1536,
      distance: 'Cosine'
    },
    {
      name: 'research_data',
      vectorSize: 1536,
      distance: 'Cosine'
    },
    {
      name: 'knowledge_base',
      vectorSize: 1536,
      distance: 'Cosine'
    }
  ];

  for (const collection of collections) {
    try {
      const exists = await client.getCollections();
      const collectionExists = exists.collections.some(c => c.name === collection.name);
      
      if (!collectionExists) {
        await client.createCollection(collection.name, {
          vectors: {
            size: collection.vectorSize,
            distance: collection.distance
          }
        });
        console.log(`Created Qdrant collection: ${collection.name}`);
      }
    } catch (error) {
      console.error(`Error creating collection ${collection.name}:`, error.message);
    }
  }
};

module.exports = {
  getQdrantClient,
  initializeQdrantCollections
};
