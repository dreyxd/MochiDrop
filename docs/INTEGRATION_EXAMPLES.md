# MochiDrop Integration Examples

Real-world examples of integrating MochiDrop into your applications.

## 🎯 Quick Start Integration

### 1. Basic Project Setup

```python
# setup.py
from mochidrop import MochiDropAPI

# Initialize the API client
api = MochiDropAPI(api_key="your-api-key")

# Create your first project
project = api.create_project(
    name="DeFi Protocol Launch",
    description="Revolutionary DeFi protocol with yield farming",
    website_url="https://mydefi.com",
    twitter_handle="mydefi",
    discord_url="https://discord.gg/mydefi"
)

print(f"Project created with ID: {project['id']}")
print(f"Project key: {project['project_key']}")
```

### 2. Launch Your First Airdrop

```python
# airdrop_launch.py
import datetime

# Create an airdrop
airdrop = api.create_airdrop(
    project_id=project['id'],
    name="Genesis Airdrop",
    description="Early adopter rewards",
    total_amount="1000000",
    token_symbol="DEFI",
    start_date=datetime.datetime.now(),
    end_date=datetime.datetime.now() + datetime.timedelta(days=30),
    max_participants=1000,
    requirements=["follow_twitter", "join_discord", "hold_nft"]
)

print(f"Airdrop created: {airdrop['name']}")
```

## 🔗 Web Application Integration

### React.js Dashboard Integration

```jsx
// components/ProjectDashboard.jsx
import React, { useState, useEffect } from 'react';
import { MochiDropAPI } from 'mochidrop-js';

const ProjectDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const api = new MochiDropAPI(process.env.REACT_APP_MOCHIDROP_API_KEY);
    
    useEffect(() => {
        loadProjects();
    }, []);
    
    const loadProjects = async () => {
        try {
            const response = await api.getProjects();
            setProjects(response.projects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const createProject = async (projectData) => {
        try {
            const newProject = await api.createProject(
                projectData.name,
                projectData.description
            );
            setProjects([...projects, newProject]);
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="project-dashboard">
            <h1>My Projects</h1>
            <div className="projects-grid">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project}
                        onUpdate={loadProjects}
                    />
                ))}
            </div>
            <CreateProjectModal onSubmit={createProject} />
        </div>
    );
};

// components/ProjectCard.jsx
const ProjectCard = ({ project, onUpdate }) => {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        loadStats();
    }, [project.id]);
    
    const loadStats = async () => {
        const api = new MochiDropAPI(process.env.REACT_APP_MOCHIDROP_API_KEY);
        const projectStats = await api.getProjectStats(project.id);
        setStats(projectStats);
    };
    
    return (
        <div className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-stats">
                <div>Participants: {stats?.participants.total || 0}</div>
                <div>Airdrops: {stats?.airdrops.total || 0}</div>
                <div>Claims: {stats?.claims.total || 0}</div>
            </div>
            <div className="project-actions">
                <button onClick={() => window.open(`/projects/${project.id}`)}>
                    Manage
                </button>
            </div>
        </div>
    );
};
```

### Next.js API Routes

```javascript
// pages/api/projects/index.js
import { MochiDropAPI } from 'mochidrop-js';

const api = new MochiDropAPI(process.env.MOCHIDROP_API_KEY);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const projects = await api.getProjects();
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, description, website_url } = req.body;
            const project = await api.createProject(name, description, {
                website_url
            });
            res.status(201).json(project);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create project' });
        }
    }
}

// pages/api/airdrops/[projectId].js
export default async function handler(req, res) {
    const { projectId } = req.query;
    
    if (req.method === 'GET') {
        try {
            const airdrops = await api.getProjectAirdrops(projectId);
            res.status(200).json(airdrops);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch airdrops' });
        }
    } else if (req.method === 'POST') {
        try {
            const airdropData = req.body;
            const airdrop = await api.createAirdrop({
                project_id: projectId,
                ...airdropData
            });
            res.status(201).json(airdrop);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create airdrop' });
        }
    }
}
```

## 🤖 Discord Bot Integration

```javascript
// discord-bot.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { MochiDropAPI } = require('mochidrop-js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const api = new MochiDropAPI(process.env.MOCHIDROP_API_KEY);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Command: !airdrop status
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!airdrop status')) {
        const projectId = 1; // Your project ID
        
        try {
            const airdrops = await api.getProjectAirdrops(projectId);
            const activeAirdrops = airdrops.airdrops.filter(a => a.is_active);
            
            const embed = new EmbedBuilder()
                .setTitle('🎁 Active Airdrops')
                .setColor(0x00AE86);
            
            if (activeAirdrops.length === 0) {
                embed.setDescription('No active airdrops at the moment.');
            } else {
                activeAirdrops.forEach(airdrop => {
                    embed.addFields({
                        name: airdrop.name,
                        value: `**Amount:** ${airdrop.total_amount} ${airdrop.token_symbol}\n**Participants:** ${airdrop.participants_count}/${airdrop.max_participants}\n**Ends:** ${new Date(airdrop.end_date).toLocaleDateString()}`,
                        inline: true
                    });
                });
            }
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('Failed to fetch airdrop status.');
        }
    }
});

// Command: !project stats
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!project stats')) {
        const projectId = 1; // Your project ID
        
        try {
            const stats = await api.getProjectStats(projectId);
            
            const embed = new EmbedBuilder()
                .setTitle('📊 Project Statistics')
                .setColor(0x0099FF)
                .addFields(
                    { name: 'Total Participants', value: stats.participants.total.toString(), inline: true },
                    { name: 'New This Month', value: stats.participants.new.toString(), inline: true },
                    { name: 'Growth Rate', value: `${stats.participants.growth_rate}%`, inline: true },
                    { name: 'Total Airdrops', value: stats.airdrops.total.toString(), inline: true },
                    { name: 'Active Airdrops', value: stats.airdrops.active.toString(), inline: true },
                    { name: 'Tokens Distributed', value: stats.tokens_distributed, inline: true }
                );
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('Failed to fetch project statistics.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
```

## 📱 Mobile App Integration (React Native)

```javascript
// services/MochiDropService.js
import { MochiDropAPI } from 'mochidrop-js';

class MochiDropService {
    constructor() {
        this.api = new MochiDropAPI(process.env.MOCHIDROP_API_KEY);
    }
    
    async getProjects() {
        try {
            const response = await this.api.getProjects();
            return response.projects;
        } catch (error) {
            throw new Error('Failed to fetch projects');
        }
    }
    
    async getProjectDetails(projectId) {
        try {
            return await this.api.getProject(projectId);
        } catch (error) {
            throw new Error('Failed to fetch project details');
        }
    }
    
    async getProjectAirdrops(projectId) {
        try {
            const response = await this.api.getProjectAirdrops(projectId);
            return response.airdrops;
        } catch (error) {
            throw new Error('Failed to fetch airdrops');
        }
    }
}

export default new MochiDropService();

// components/ProjectList.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import MochiDropService from '../services/MochiDropService';

const ProjectList = ({ navigation }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadProjects();
    }, []);
    
    const loadProjects = async () => {
        try {
            const projectList = await MochiDropService.getProjects();
            setProjects(projectList);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const renderProject = ({ item }) => (
        <TouchableOpacity
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
        >
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectDescription}>{item.description}</Text>
            <View style={styles.projectStats}>
                <Text>Participants: {item.participants_count}</Text>
                <Text>Airdrops: {item.airdrops_count}</Text>
            </View>
        </TouchableOpacity>
    );
    
    if (loading) {
        return (
            <View style={styles.loading}>
                <Text>Loading projects...</Text>
            </View>
        );
    }
    
    return (
        <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={item => item.id.toString()}
            style={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    projectCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    projectName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    projectDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    projectStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProjectList;
```

## 🔔 Webhook Integration

### Express.js Webhook Handler

```javascript
// webhook-server.js
const express = require('express');
const crypto = require('crypto');
const { MochiDropAPI } = require('mochidrop-js');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.MOCHIDROP_WEBHOOK_SECRET;
const api = new MochiDropAPI(process.env.MOCHIDROP_API_KEY);

// Verify webhook signature
const verifySignature = (req, res, next) => {
    const signature = req.headers['x-mochidrop-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
        return res.status(401).send('Invalid signature');
    }
    
    next();
};

// Handle webhook events
app.post('/webhook', verifySignature, async (req, res) => {
    const { event, data } = req.body;
    
    try {
        switch (event) {
            case 'user.joined':
                await handleUserJoined(data);
                break;
            case 'airdrop.claimed':
                await handleAirdropClaimed(data);
                break;
            case 'project.updated':
                await handleProjectUpdated(data);
                break;
            default:
                console.log(`Unknown event: ${event}`);
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function handleUserJoined(data) {
    console.log(`New user joined project ${data.project_id}: ${data.username}`);
    
    // Send welcome email
    await sendWelcomeEmail(data.user_id);
    
    // Update analytics
    await updateUserAnalytics(data.project_id, 'user_joined');
}

async function handleAirdropClaimed(data) {
    console.log(`Airdrop claimed: ${data.amount} tokens by user ${data.user_id}`);
    
    // Send confirmation email
    await sendClaimConfirmation(data.user_id, data.amount);
    
    // Update project statistics
    await updateProjectStats(data.project_id, 'claim', data.amount);
}

async function handleProjectUpdated(data) {
    console.log(`Project ${data.project_id} updated`);
    
    // Sync with internal database
    await syncProjectData(data.project_id);
}

app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
});
```

### Django Webhook Handler

```python
# views.py
import json
import hmac
import hashlib
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import Project, User
from .tasks import send_welcome_email, update_analytics

@csrf_exempt
@require_http_methods(["POST"])
def webhook_handler(request):
    # Verify signature
    signature = request.headers.get('X-MochiDrop-Signature')
    if not verify_signature(request.body, signature):
        return HttpResponseBadRequest('Invalid signature')
    
    try:
        payload = json.loads(request.body)
        event = payload.get('event')
        data = payload.get('data')
        
        if event == 'user.joined':
            handle_user_joined(data)
        elif event == 'airdrop.claimed':
            handle_airdrop_claimed(data)
        elif event == 'project.updated':
            handle_project_updated(data)
        
        return HttpResponse('OK')
    except Exception as e:
        print(f"Webhook error: {e}")
        return HttpResponseBadRequest('Error processing webhook')

def verify_signature(payload, signature):
    expected_signature = hmac.new(
        settings.MOCHIDROP_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return signature == f"sha256={expected_signature}"

def handle_user_joined(data):
    # Update local user database
    User.objects.update_or_create(
        telegram_id=data['telegram_id'],
        defaults={
            'username': data['username'],
            'project_id': data['project_id']
        }
    )
    
    # Send welcome email asynchronously
    send_welcome_email.delay(data['user_id'])

def handle_airdrop_claimed(data):
    # Update analytics
    update_analytics.delay(data['project_id'], 'claim', data['amount'])
    
    # Log the claim
    print(f"User {data['user_id']} claimed {data['amount']} tokens")
```

## 📊 Analytics Integration

### Google Analytics Integration

```javascript
// analytics.js
import { MochiDropAPI } from 'mochidrop-js';
import { gtag } from 'ga-gtag';

class MochiDropAnalytics {
    constructor(apiKey, gaTrackingId) {
        this.api = new MochiDropAPI(apiKey);
        this.gaTrackingId = gaTrackingId;
    }
    
    async trackProjectCreation(projectData) {
        // Track in Google Analytics
        gtag('event', 'project_created', {
            event_category: 'MochiDrop',
            event_label: projectData.name,
            value: 1
        });
        
        // Get project stats for additional tracking
        const stats = await this.api.getProjectStats(projectData.id);
        
        gtag('event', 'project_stats', {
            event_category: 'MochiDrop',
            custom_map: {
                participants: stats.participants.total,
                airdrops: stats.airdrops.total
            }
        });
    }
    
    async trackAirdropLaunch(airdropData) {
        gtag('event', 'airdrop_launched', {
            event_category: 'MochiDrop',
            event_label: airdropData.name,
            value: parseInt(airdropData.total_amount)
        });
    }
    
    async syncDailyStats() {
        const projects = await this.api.getProjects();
        
        for (const project of projects.projects) {
            const stats = await this.api.getProjectStats(project.id, '1d');
            
            // Send custom metrics to GA
            gtag('config', this.gaTrackingId, {
                custom_map: {
                    [`project_${project.id}_participants`]: stats.participants.total,
                    [`project_${project.id}_claims`]: stats.claims.total
                }
            });
        }
    }
}

export default MochiDropAnalytics;
```

## 🔄 Automated Workflows

### GitHub Actions Integration

```yaml
# .github/workflows/mochidrop-sync.yml
name: MochiDrop Sync

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync-projects:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install mochidrop-js
        
      - name: Sync MochiDrop data
        env:
          MOCHIDROP_API_KEY: ${{ secrets.MOCHIDROP_API_KEY }}
        run: |
          node scripts/sync-mochidrop.js
          
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git diff --staged --quiet || git commit -m "Update MochiDrop data"
          git push
```

```javascript
// scripts/sync-mochidrop.js
const { MochiDropAPI } = require('mochidrop-js');
const fs = require('fs');

const api = new MochiDropAPI(process.env.MOCHIDROP_API_KEY);

async function syncData() {
    try {
        // Get all projects
        const projects = await api.getProjects();
        
        // Get detailed stats for each project
        const projectsWithStats = await Promise.all(
            projects.projects.map(async (project) => {
                const stats = await api.getProjectStats(project.id);
                return { ...project, stats };
            })
        );
        
        // Save to file
        fs.writeFileSync(
            'data/mochidrop-projects.json',
            JSON.stringify(projectsWithStats, null, 2)
        );
        
        console.log(`Synced ${projectsWithStats.length} projects`);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncData();
```

## 🎨 Custom UI Components

### Vue.js Components

```vue
<!-- components/AirdropCard.vue -->
<template>
  <div class="airdrop-card">
    <div class="airdrop-header">
      <h3>{{ airdrop.name }}</h3>
      <span class="status-badge" :class="statusClass">
        {{ airdrop.is_active ? 'Active' : 'Ended' }}
      </span>
    </div>
    
    <p class="airdrop-description">{{ airdrop.description }}</p>
    
    <div class="airdrop-stats">
      <div class="stat">
        <span class="label">Total Amount</span>
        <span class="value">{{ formatAmount(airdrop.total_amount) }} {{ airdrop.token_symbol }}</span>
      </div>
      
      <div class="stat">
        <span class="label">Participants</span>
        <span class="value">{{ airdrop.participants_count }} / {{ airdrop.max_participants }}</span>
      </div>
      
      <div class="stat">
        <span class="label">Claims</span>
        <span class="value">{{ airdrop.claims_count }}</span>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    
    <div class="airdrop-actions">
      <button @click="viewDetails" class="btn-primary">View Details</button>
      <button @click="editAirdrop" class="btn-secondary">Edit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AirdropCard',
  props: {
    airdrop: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusClass() {
      return this.airdrop.is_active ? 'status-active' : 'status-ended';
    },
    progressPercentage() {
      if (!this.airdrop.max_participants) return 0;
      return (this.airdrop.participants_count / this.airdrop.max_participants) * 100;
    }
  },
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat().format(amount);
    },
    viewDetails() {
      this.$router.push(`/airdrops/${this.airdrop.id}`);
    },
    editAirdrop() {
      this.$emit('edit', this.airdrop);
    }
  }
};
</script>

<style scoped>
.airdrop-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.airdrop-card:hover {
  transform: translateY(-2px);
}

.airdrop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #10b981;
  color: white;
}

.status-ended {
  background: #6b7280;
  color: white;
}

.airdrop-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.stat {
  text-align: center;
}

.stat .label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat .value {
  font-weight: 600;
  color: #111827;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s;
}

.airdrop-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
```

These integration examples provide a comprehensive foundation for developers to build upon when integrating MochiDrop into their applications. Each example includes error handling, best practices, and real-world scenarios that developers commonly encounter.

## 🚀 Next Steps

1. **Choose your integration approach** based on your tech stack
2. **Set up your development environment** with the appropriate SDK
3. **Test with the sandbox environment** before going live
4. **Implement webhook handlers** for real-time updates
5. **Add analytics tracking** to monitor performance
6. **Deploy and monitor** your integration

For more detailed examples and advanced use cases, visit our [GitHub repository](https://github.com/dreyxd/MochiDrop) or join our [Discord community](https://discord.gg/mochidrop).