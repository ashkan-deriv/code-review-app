import { Octokit } from '@octokit/rest';
import { reviewCode } from '../services/openai.js';

const octokit = new Octokit({
  auth: process.env.GITHUB_CLIENT_SECRET
});

export async function handlePullRequest({ payload }) {
  const { pull_request, repository } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const pull_number = pull_request.number;

  try {
    // Get the files changed in the PR
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });

    // Filter out files we don't want to review (e.g., package-lock.json, images)
    const reviewableFiles = files.filter(file => {
      const fileExtension = file.filename.split('.').pop().toLowerCase();
      const skipExtensions = ['lock', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2'];
      return !skipExtensions.includes(fileExtension);
    });

    // Get the content of each file
    const filesWithContent = await Promise.all(
      reviewableFiles.map(async (file) => {
        const { data: content } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref: pull_request.head.sha,
        });

        return {
          name: file.filename,
          path: file.filename,
          content: Buffer.from(content.content, 'base64').toString('utf-8'),
        };
      })
    );

    // Get AI review for the files
    const reviews = await reviewCode(filesWithContent);

    // Post review comments
    for (const review of reviews) {
      await octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        commit_id: pull_request.head.sha,
        body: `# AI Code Review for ${review.file}\n\n${review.review}`,
        event: 'COMMENT'
      });
    }

  } catch (error) {
    console.error('Error handling pull request:', error);
    
    // Post error as a comment on the PR
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: 'Error occurred during AI code review. Please check the logs for more details.'
    });
  }
}
