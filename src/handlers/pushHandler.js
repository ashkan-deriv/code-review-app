import { Octokit } from '@octokit/rest';
import { reviewCode } from '../services/openai.js';

const octokit = new Octokit({
  auth: process.env.GITHUB_CLIENT_SECRET
});

export async function handlePush({ payload }) {
  const { repository, commits, ref } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const branch = ref.replace('refs/heads/', '');

  // Skip if no commits
  if (commits.length === 0) return;

  try {
    // Get the latest commit
    const latestCommit = commits[commits.length - 1];
    
    // Get the commit details
    const { data: commitData } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: latestCommit.id
    });

    // Filter files to review
    const reviewableFiles = commitData.files.filter(file => {
      const fileExtension = file.filename.split('.').pop().toLowerCase();
      const skipExtensions = ['lock', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2'];
      return !skipExtensions.includes(fileExtension);
    });

    // Get content of modified files
    const filesWithContent = await Promise.all(
      reviewableFiles.map(async (file) => {
        const { data: content } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref: latestCommit.id
        });

        return {
          name: file.filename,
          path: file.filename,
          content: Buffer.from(content.content, 'base64').toString('utf-8')
        };
      })
    );

    // Get AI review
    const reviews = await reviewCode(filesWithContent);

    // Create a new issue with the review
    const issueBody = reviews.map(review => (
      `## Review for ${review.file}\n\n${review.review}\n\n---\n\n`
    )).join('');

    await octokit.issues.create({
      owner,
      repo,
      title: `AI Code Review for commit ${latestCommit.id.substring(0, 7)}`,
      body: `Code review for commit pushed to \`${branch}\` branch.\n\n${issueBody}`,
      labels: ['ai-review']
    });

  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Create issue for the error
    await octokit.issues.create({
      owner,
      repo,
      title: `Error in AI Code Review for ${branch}`,
      body: 'An error occurred during the automated code review. Please check the logs for more details.',
      labels: ['ai-review', 'error']
    });
  }
}
