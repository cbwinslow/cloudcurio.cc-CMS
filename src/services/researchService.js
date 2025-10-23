const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');

class ResearchService {
  constructor() {
    this.searxngUrl = process.env.SEARXNG_URL || 'http://localhost:8888';
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.rssParser = new Parser();
  }

  // Search using SearXNG
  async searchWeb(query, options = {}) {
    const {
      categories = 'general',
      engines = '',
      language = 'en',
      timeRange = '',
      limit = 10
    } = options;

    try {
      const params = {
        q: query,
        format: 'json',
        categories: categories,
        language: language
      };

      if (engines) params.engines = engines;
      if (timeRange) params.time_range = timeRange;

      const response = await axios.get(`${this.searxngUrl}/search`, { params });
      
      return response.data.results.slice(0, limit).map(result => ({
        url: result.url,
        title: result.title,
        content: result.content,
        sourceType: 'web',
        extractedAt: new Date(),
        relevanceScore: result.score || 0.5
      }));
    } catch (error) {
      console.error('Error searching web:', error.message);
      return [];
    }
  }

  // Fetch and parse web page content
  async fetchPageContent(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CloudCurio-CMS/1.0; +http://cloudcurio.cc)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Remove script, style, and other non-content tags
      $('script, style, nav, header, footer, aside, iframe').remove();
      
      // Extract main content
      const title = $('h1').first().text() || $('title').text();
      const content = $('article, main, .content, .post-content, body').first().text().trim();
      
      return {
        title: title.trim(),
        content: content.substring(0, 5000), // Limit content length
        url: url
      };
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error.message);
      return null;
    }
  }

  // Aggregate news from RSS feeds
  async aggregateNews(topics = [], limit = 20) {
    const feeds = [
      'https://news.ycombinator.com/rss',
      'https://www.reddit.com/r/technology/.rss',
      'https://techcrunch.com/feed/',
      'https://feeds.arstechnica.com/arstechnica/index',
      'https://www.wired.com/feed/rss'
    ];

    const allItems = [];

    for (const feedUrl of feeds) {
      try {
        const feed = await this.rssParser.parseURL(feedUrl);
        
        const items = feed.items.map(item => ({
          title: item.title,
          content: item.contentSnippet || item.content,
          url: item.link,
          sourceType: 'news',
          extractedAt: new Date(item.pubDate || Date.now()),
          source: feed.title
        }));

        allItems.push(...items);
      } catch (error) {
        console.error(`Error parsing feed ${feedUrl}:`, error.message);
      }
    }

    // Filter by topics if provided
    if (topics.length > 0) {
      const filtered = allItems.filter(item => {
        const text = `${item.title} ${item.content}`.toLowerCase();
        return topics.some(topic => text.includes(topic.toLowerCase()));
      });
      return filtered.slice(0, limit);
    }

    return allItems.slice(0, limit);
  }

  // Deep research on a topic
  async deepResearch(topic, tags = []) {
    const results = {
      webResults: [],
      newsResults: [],
      extractedContent: []
    };

    // Search web
    const searchQuery = tags.length > 0 ? `${topic} ${tags.join(' ')}` : topic;
    results.webResults = await this.searchWeb(searchQuery, { limit: 10 });

    // Aggregate news
    results.newsResults = await this.aggregateNews([topic, ...tags], 10);

    // Fetch detailed content from top results
    const topUrls = results.webResults.slice(0, 5).map(r => r.url);
    
    for (const url of topUrls) {
      const content = await this.fetchPageContent(url);
      if (content) {
        results.extractedContent.push(content);
      }
    }

    return results;
  }

  // Search academic sources (placeholder for future integration)
  async searchAcademic(query) {
    // This would integrate with Google Scholar, arXiv, or other academic databases
    // For now, return empty array
    return [];
  }
}

module.exports = new ResearchService();
