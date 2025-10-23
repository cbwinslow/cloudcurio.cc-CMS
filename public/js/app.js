const API_BASE = window.location.origin + '/api';

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        
        // Load data for tab
        if (tabName === 'articles') loadArticles();
        if (tabName === 'research') loadResearch();
        if (tabName === 'workflow') loadWorkflowTasks();
    });
});

// Generate Article Form
document.getElementById('generateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById('topic').value;
    const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t);
    
    showResult('generateResult', 'Generating article... This may take a few moments.', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/workflow/generate-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, tags })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult('generateResult', `
                ✅ Article generated successfully!
                <br><strong>Article ID:</strong> ${data.articleId}
                <br><strong>Research ID:</strong> ${data.researchId}
                <br><strong>Sources:</strong> ${data.summary.sourceCount}
                <br><strong>Words:</strong> ${data.summary.wordCount}
            `, 'success');
            
            document.getElementById('generateForm').reset();
        } else {
            showResult('generateResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult('generateResult', `❌ Error: ${error.message}`, 'error');
    }
});

// Batch Generate Form
document.getElementById('batchGenerateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topicsText = document.getElementById('batchTopics').value;
    const topics = topicsText.split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(topic => ({ topic, tags: [] }));
    
    if (topics.length === 0) {
        showResult('batchResult', '❌ Please enter at least one topic', 'error');
        return;
    }
    
    showResult('batchResult', `Generating ${topics.length} articles... This will take some time.`, 'info');
    
    try {
        const response = await fetch(`${API_BASE}/workflow/batch-generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topics })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult('batchResult', `
                ✅ Batch generation completed!
                <br><strong>Total:</strong> ${data.totalCount}
                <br><strong>Success:</strong> ${data.successCount}
                <br><strong>Failed:</strong> ${data.failureCount}
            `, 'success');
            
            document.getElementById('batchGenerateForm').reset();
        } else {
            showResult('batchResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult('batchResult', `❌ Error: ${error.message}`, 'error');
    }
});

// Research Form
document.getElementById('researchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = document.getElementById('researchTopic').value;
    const tags = document.getElementById('researchTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    showResult('researchResult', 'Performing deep research...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, tags })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult('researchResult', `
                ✅ Research completed!
                <br><strong>Research ID:</strong> ${data.researchId}
                <br><strong>Sources:</strong> ${data.sourceCount}
                <br><strong>Key Points:</strong> ${data.keyPoints.length}
            `, 'success');
            
            loadResearch();
            document.getElementById('researchForm').reset();
        } else {
            showResult('researchResult', `❌ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        showResult('researchResult', `❌ Error: ${error.message}`, 'error');
    }
});

// Chat Form
document.getElementById('chatForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = document.getElementById('chatMessage').value;
    if (!message) return;
    
    addChatMessage(message, 'user');
    document.getElementById('chatMessage').value = '';
    
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        addChatMessage(data.response || data.error, 'assistant');
    } catch (error) {
        addChatMessage(`Error: ${error.message}`, 'assistant');
    }
});

// Load Articles
async function loadArticles() {
    const container = document.getElementById('articlesList');
    container.innerHTML = '<div class="loading">Loading articles...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/articles?limit=20`);
        const data = await response.json();
        
        if (data.articles.length === 0) {
            container.innerHTML = '<p>No articles found. Generate some!</p>';
            return;
        }
        
        container.innerHTML = data.articles.map(article => `
            <div class="article-item">
                <h3>${article.title}</h3>
                <p>${article.excerpt || 'No excerpt available'}</p>
                <div class="tags">
                    <span class="status ${article.status}">${article.status}</span>
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <small>Views: ${article.views} | Created: ${new Date(article.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading articles: ${error.message}</p>`;
    }
}

// Load Research
async function loadResearch() {
    const container = document.getElementById('researchList');
    container.innerHTML = '<div class="loading">Loading research...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/research?limit=10`);
        const data = await response.json();
        
        if (data.research.length === 0) {
            container.innerHTML = '<p>No research found. Start a research task!</p>';
            return;
        }
        
        container.innerHTML = data.research.map(research => `
            <div class="research-item">
                <h3>${research.topic}</h3>
                <p>${research.summary}</p>
                <div class="tags">
                    <span class="status ${research.status}">${research.status}</span>
                    ${research.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <small>Sources: ${research.sources.length} | ${new Date(research.createdAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading research: ${error.message}</p>`;
    }
}

// Load News
async function loadNews() {
    const container = document.getElementById('newsList');
    container.innerHTML = '<div class="loading">Loading news...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/research/news?limit=15`);
        const data = await response.json();
        
        if (data.news.length === 0) {
            container.innerHTML = '<p>No news found.</p>';
            return;
        }
        
        container.innerHTML = data.news.map(item => `
            <div class="news-item">
                <h4><a href="${item.url}" target="_blank">${item.title}</a></h4>
                <p>${item.content}</p>
                <small>${item.source || 'Unknown'} | ${new Date(item.extractedAt).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading news: ${error.message}</p>`;
    }
}

// Load Workflow Tasks
async function loadWorkflowTasks() {
    const container = document.getElementById('tasksList');
    const filter = document.getElementById('taskFilter').value;
    
    container.innerHTML = '<div class="loading">Loading tasks...</div>';
    
    try {
        const url = filter ? `${API_BASE}/workflow/tasks?status=${filter}` : `${API_BASE}/workflow/tasks`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.tasks.length === 0) {
            container.innerHTML = '<p>No tasks found.</p>';
            return;
        }
        
        container.innerHTML = data.tasks.map(task => `
            <div class="task-item">
                <h3>${task.name}</h3>
                <p>Type: ${task.type} | Agent: ${task.agent}</p>
                <div class="tags">
                    <span class="status ${task.status}">${task.status}</span>
                    <span class="tag">Priority: ${task.priority}</span>
                </div>
                <small>Created: ${new Date(task.createdAt).toLocaleDateString()}</small>
                ${task.errors.length > 0 ? `<p class="error">Errors: ${task.errors[0].message}</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading tasks: ${error.message}</p>`;
    }
}

// Process Pending Tasks
async function processPendingTasks() {
    if (!confirm('Process all pending tasks?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/workflow/process-pending`, { method: 'POST' });
        const data = await response.json();
        
        alert(`Processed ${data.processedCount} tasks`);
        loadWorkflowTasks();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Helper: Show Result
function showResult(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = message;
    element.className = `result-box ${type}`;
}

// Helper: Add Chat Message
function addChatMessage(message, sender) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// Task filter
document.getElementById('taskFilter')?.addEventListener('change', loadWorkflowTasks);

// Initialize
console.log('CloudCurio CMS Frontend Loaded');
