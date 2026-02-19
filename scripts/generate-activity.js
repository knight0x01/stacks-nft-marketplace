const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const LOG_FILE = 'activity.log';
const COUNT = 200;

function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        process.exit(1);
    }
}

console.log(`🚀 Starting generation of ${COUNT} commits...`);

if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '# Activity Log\n');
}

for (let i = 1; i <= COUNT; i++) {
    const timestamp = new Date().toISOString();
    const entry = `Activity update ${i} at ${timestamp}\n`;

    fs.appendFileSync(LOG_FILE, entry);

    runCommand(`git add -f ${LOG_FILE}`);
    runCommand(`git commit -m "chore: activity update ${timestamp}"`);

    if (i % 10 === 0) {
        console.log(`✅ Generated ${i}/${COUNT} commits...`);
    }
}

console.log('\n📦 Pushing changes to remote...');
runCommand('git push');

console.log('\n🎉 Finished! Generated 200 commits.');
