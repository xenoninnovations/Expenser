const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const { exec } = require('child_process');

console.log("Running post-install script...");

const envPath = path.join(__dirname, 'client', '.env');
const privateKeyFilePath = path.join(__dirname, 'server', 'private-key.json');

const envExists = fs.existsSync(envPath);
let firebaseKeyExists = false;

if (fs.existsSync(privateKeyFilePath)) {
    try {
        const content = JSON.parse(fs.readFileSync(privateKeyFilePath, 'utf8'));
        // Check for expected keys in the Firebase service account key
        if (content.type === 'service_account' && content.private_key && content.client_email) {
            firebaseKeyExists = true;
        }
    } catch (e) {
        console.error('Error reading or parsing private-key.json:', e.message);
    }
}

inquirer
    .prompt([
        {
            type: 'confirm',
            name: 'continueInstall',
            message: generateMissingMessage(envExists, firebaseKeyExists),
            default: false,
        },
    ])
    .then(({ continueInstall }) => {
        if (!continueInstall) {
            console.log('Aborting setup. Add the missing files and try again.');
            return;
        }

        return inquirer.prompt([
            {
                type: 'confirm',
                name: 'runDev',
                message: 'Would you like to start both the server and client now?',
                default: true,
            },
        ]);
    })
    .then((devAnswer) => {
        if (devAnswer && devAnswer.runDev) {
            console.log('Starting both the client and server...');
            exec('npm run dev', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error: ${err}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        } else if (devAnswer) {
            console.log('Setup complete. You can start the app later with "npm run dev".');
        }
    })
    .catch(error => {
        console.error('Error during prompt:', error);
    });

function generateMissingMessage(envExists, keyExists) {
    const messages = [];
    if (!envExists) messages.push('.env file in client folder is missing');
    if (!keyExists) messages.push('Firebase private-key.json in server folder is missing');
    return messages.length === 0
        ? 'All required files are present. Continue with setup?'
        : `Missing required files: ${messages.join(', ')}. Continue anyway?`;
}
