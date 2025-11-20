```dockerfile:Dockerfile:mega-agency-bridge/Dockerfile\nFROM node:20-slim\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n
