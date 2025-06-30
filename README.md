# Automate-Custom-UI

## Apps You Will Need or Want
- Visual Studio Code (or similar code editing app) - (Highly Recommended)
  - Download VSCode [here](https://code.visualstudio.com/download).

## Pre-Requisite Installations (NEEDED)
### Install Node.js (to run mvn commands)
NOTE: If you are on a windows machine, you can access a Terminal window to run the below commands within Visual Studio Code (recommended application) by using the top menu bar, selecting **View**, then selecting **Terminal**.
1. Open a Terminal Window and enter the following command to install npm:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
2. This command will set the HOME global variable:
```
\. "$HOME/.nvm/nvm.sh"
```
3. Run this command to install Node.js:
```
nvm install 22
```
4. Run this command after installation to ensure Node.js is installed and check version:
```
node -v
```
5. Verify npm version:
```
npm -v
```
**This should be all that is necessary to create a Custom UI. Use the Guides below.**

## Generate a Custom UI & Download Source Code
[Create a Custom UI](/Create-Custom-UI.md)
