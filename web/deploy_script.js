const { exec } = require('child_process');
exec('npx netlify-cli api createSite --data "{\\"name\\":\\"ai-news-portal-khaopan-2026\\"}"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
