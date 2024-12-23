import express from 'express';
import dotenv from 'dotenv';
import { Webhooks } from '@octokit/webhooks';
import { Octokit } from '@octokit/rest';
import { reviewCode } from './services/openai.js';
import { handlePullRequest } from './handlers/pullRequestHandler.js';
import { handlePush } from './handlers/pushHandler.js';

dotenv.config();

const app = express();
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET
});

const octokit = new Octokit({
  auth: process.env.GITHUB_CLIENT_SECRET,
  previews: ['machine-man-preview']
});

// Webhook event handlers
webhooks.on('pull_request.opened', handlePullRequest);
webhooks.on('pull_request.synchronize', handlePullRequest);
webhooks.on('push', handlePush);

// Express middleware
app.use(express.json());

// Webhook endpoint
app.post('/api/webhook', (req, res) => {
  webhooks.verifyAndReceive({
    id: req.headers['x-github-delivery'],
    name: req.headers['x-github-event'],
    payload: req.body,
    signature: req.headers['x-hub-signature-256']
  }).catch(console.error);
  
  res.status(200).send('Webhook received');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
