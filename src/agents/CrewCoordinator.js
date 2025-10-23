const ResearchAgent = require('./ResearchAgent');
const WriterAgent = require('./WriterAgent');
const WorkflowTask = require('../models/WorkflowTask');

class CrewCoordinator {
  constructor() {
    this.name = 'CrewCoordinator';
    this.agents = {
      research: ResearchAgent,
      writer: WriterAgent
    };
  }

  // Execute a complete article generation workflow
  async executeArticleWorkflow(topic, tags = []) {
    try {
      console.log(`[${this.name}] Starting workflow for: ${topic}`);

      // Step 1: Create workflow tasks
      const researchTask = new WorkflowTask({
        name: `Research: ${topic}`,
        type: 'research',
        status: 'pending',
        priority: 8,
        input: {
          topic,
          tags
        },
        agent: 'ResearchAgent'
      });
      await researchTask.save();

      // Step 2: Execute research
      console.log(`[${this.name}] Executing research task...`);
      researchTask.status = 'running';
      researchTask.startedAt = new Date();
      await researchTask.save();

      const researchResult = await ResearchAgent.executeTask({
        topic,
        tags
      });

      if (!researchResult.success) {
        researchTask.status = 'failed';
        researchTask.errors.push({
          message: researchResult.error,
          timestamp: new Date()
        });
        await researchTask.save();
        throw new Error(`Research failed: ${researchResult.error}`);
      }

      researchTask.status = 'completed';
      researchTask.completedAt = new Date();
      researchTask.output = {
        researchId: researchResult.researchId,
        data: researchResult
      };
      await researchTask.save();

      // Step 3: Create writing task
      const writingTask = new WorkflowTask({
        name: `Write: ${topic}`,
        type: 'generation',
        status: 'pending',
        priority: 7,
        input: {
          topic,
          tags,
          researchId: researchResult.researchId
        },
        agent: 'WriterAgent'
      });
      await writingTask.save();

      // Step 4: Execute writing
      console.log(`[${this.name}] Executing writing task...`);
      writingTask.status = 'running';
      writingTask.startedAt = new Date();
      await writingTask.save();

      const writingResult = await WriterAgent.executeTask({
        topic,
        tags,
        researchId: researchResult.researchId
      });

      if (!writingResult.success) {
        writingTask.status = 'failed';
        writingTask.errors.push({
          message: writingResult.error,
          timestamp: new Date()
        });
        await writingTask.save();
        throw new Error(`Writing failed: ${writingResult.error}`);
      }

      writingTask.status = 'completed';
      writingTask.completedAt = new Date();
      writingTask.output = {
        articleId: writingResult.articleId,
        data: writingResult
      };
      await writingTask.save();

      console.log(`[${this.name}] Workflow completed successfully`);

      return {
        success: true,
        researchTaskId: researchTask._id,
        writingTaskId: writingTask._id,
        researchId: researchResult.researchId,
        articleId: writingResult.articleId,
        summary: {
          topic,
          tags,
          sourceCount: researchResult.sourceCount,
          wordCount: writingResult.wordCount
        }
      };
    } catch (error) {
      console.error(`[${this.name}] Workflow error:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Execute batch workflow for multiple topics
  async executeBatchWorkflow(topics) {
    const results = [];

    for (const topicConfig of topics) {
      const { topic, tags } = topicConfig;
      const result = await this.executeArticleWorkflow(topic, tags);
      results.push(result);

      // Add delay between tasks to avoid overwhelming services
      await this.delay(2000);
    }

    return {
      success: true,
      results,
      totalCount: results.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    };
  }

  // Process pending tasks
  async processPendingTasks() {
    try {
      const pendingTasks = await WorkflowTask.find({ status: 'pending' })
        .sort({ priority: -1 })
        .limit(10);

      for (const task of pendingTasks) {
        const agent = this.agents[task.type];
        
        if (!agent) {
          console.warn(`[${this.name}] No agent found for task type: ${task.type}`);
          continue;
        }

        task.status = 'running';
        task.startedAt = new Date();
        await task.save();

        try {
          const result = await agent.executeTask(task.input);

          if (result.success) {
            task.status = 'completed';
            task.output = { data: result };
          } else {
            task.status = 'failed';
            task.errors.push({
              message: result.error,
              timestamp: new Date()
            });
          }
        } catch (error) {
          task.status = 'failed';
          task.errors.push({
            message: error.message,
            timestamp: new Date()
          });
        }

        task.completedAt = new Date();
        await task.save();
      }

      return {
        success: true,
        processedCount: pendingTasks.length
      };
    } catch (error) {
      console.error(`[${this.name}] Error processing tasks:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper: delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new CrewCoordinator();
