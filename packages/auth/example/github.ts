import { Octokit } from 'octokit'

const accessToken = process.env.GITHUB_PAT

const octokit = new Octokit({
  auth: accessToken,
})

const {
  data: { name, html_url, public_repos },
} = await octokit.rest.users.getAuthenticated()

console.log(
  `Name: ${name}, Profile URL: ${html_url}, Public Repositories: ${public_repos}`,
)
