// vaultCommit.js - Utility to commit files to 6ol-data-vault via GitHub API

let Octokit;
async function getOctokit() {
  if (!Octokit) {
    const mod = await import("@octokit/rest");
    Octokit = mod.Octokit;
  }
  return Octokit;
}

const VAULT_REPO = "4got1en/6ol-data-vault";
const VAULT_BRANCH = "main";

async function commitReflection({
  token,
  filePath,
  content,
  commitMessage = "Add reflection via 6ol bot"
}) {
  const Octokit = await getOctokit();
  const octokit = new Octokit({ auth: token });

  // Get the latest commit SHA of the branch
  const { data: refData } = await octokit.git.getRef({
    owner: "4got1en",
    repo: "6ol-data-vault",
    ref: `heads/${VAULT_BRANCH}`
  });
  const latestCommitSha = refData.object.sha;

  // Get the tree SHA
  const { data: commitData } = await octokit.git.getCommit({
    owner: "4got1en",
    repo: "6ol-data-vault",
    commit_sha: latestCommitSha
  });
  const baseTreeSha = commitData.tree.sha;

  // Create a new blob for the file
  const { data: blobData } = await octokit.git.createBlob({
    owner: "4got1en",
    repo: "6ol-data-vault",
    content: Buffer.from(content).toString("base64"),
    encoding: "base64"
  });

  // Create a new tree with the new file
  const { data: newTree } = await octokit.git.createTree({
    owner: "4got1en",
    repo: "6ol-data-vault",
    base_tree: baseTreeSha,
    tree: [
      {
        path: filePath,
        mode: "100644",
        type: "blob",
        sha: blobData.sha
      }
    ]
  });

  // Create a new commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner: "4got1en",
    repo: "6ol-data-vault",
    message: commitMessage,
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  // Update the branch reference
  await octokit.git.updateRef({
    owner: "4got1en",
    repo: "6ol-data-vault",
    ref: `heads/${VAULT_BRANCH}`,
    sha: newCommit.sha
  });

  return newCommit.sha;
}

module.exports = { commitReflection };
