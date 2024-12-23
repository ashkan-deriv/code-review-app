# GitHub AI Review App

An AI-powered code review GitHub App that automatically reviews pull requests and direct commits using OpenAI's GPT-4 model. The app provides detailed feedback on code quality, potential bugs, security issues, and suggested improvements.

## Features

- Automatic code review on pull request creation and updates
- Code review for direct commits to branches
- Detailed feedback on:
  - Code quality and best practices
  - Potential bugs and security issues
  - Performance considerations
  - Maintainability and readability
  - Suggested improvements
- Configurable file type filtering
- Error handling and reporting

## Setup

### 1. Create a GitHub App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "GitHub Apps" > "New GitHub App"
3. Fill in the following details:
   - Name: Choose a unique name for your app
   - Homepage URL: Your app's homepage or repository URL
   - Webhook URL: Your server's webhook endpoint (e.g., `https://your-domain.com/api/webhook`)
   - Webhook secret: Generate a secure random string
   
4. Set the following permissions:
   - Repository permissions:
     - Contents: Read
     - Issues: Write
     - Pull requests: Write
   - Subscribe to events:
     - Pull request
     - Push

5. After creation, note down:
   - App ID
   - Client ID
   - Client Secret
   - Generate and download a private key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the environment variables:
   ```env
   # GitHub App Configuration
   APP_ID=your_app_id
   PRIVATE_KEY=your_private_key
   WEBHOOK_SECRET=your_webhook_secret
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Server Configuration
   PORT=3000
   ```

### 3. Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### 4. Install the GitHub App

1. Go to your GitHub App's settings page
2. Click "Install App"
3. Choose the repositories you want to enable the app for
4. The app will automatically start reviewing code on:
   - New pull requests
   - Updates to existing pull requests
   - Direct commits to branches

## How It Works

### Pull Request Review Process

1. When a pull request is opened or updated, the app:
   - Retrieves the changed files
   - Filters out non-code files (images, locks, etc.)
   - Sends the code to OpenAI for review
   - Posts the review as a pull request comment

### Direct Commit Review Process

1. When code is pushed directly to a branch, the app:
   - Analyzes the commit changes
   - Filters out non-code files
   - Gets AI review feedback
   - Creates a new issue with the review results

## Error Handling

- For pull requests: Errors are posted as comments on the PR
- For direct commits: Errors create new issues with the 'error' label
- All errors are logged server-side for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
