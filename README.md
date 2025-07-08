# Automate-Custom-UI

## Apps You Will Need or Want
- Visual Studio Code (or similar code editing app) - (Highly Recommended)
  - Download VSCode [here](https://code.visualstudio.com/download).

## Pre-Requisite Installations (NEEDED)
### Install Node.js (to run mvn commands)
<!--NOTE: If you are on a windows machine, you can access a Terminal window to run the below commands within Visual Studio Code (recommended application) by using the top menu bar, selecting **View**, then selecting **Terminal**.-->
1. Install Node.js
**MAC OS**
   - Open a Terminal Window and enter the following command to install npm:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
**Windows**
   - Navigate to this url(https://nodejs.org/en/download/)[https://nodejs.org/en/download/]
     - On that page,at the top of the code box,ensure the dropdown boxes say (If not, edit the dropdown boxes): Get node.js ```v22.17.0(LTS)``` for ```Windows``` using ```Chocolatey``` with ```npm```.
     - Open the **Powershell** application on your machine **in Adminstratioin Mode**.
     - In Powershell, paste and run the **first** command, which will installnode.js.
     - **IMPORTANT**: Close Powershell and re-open in **Admin Mode** after this installs.
     - Paste and run the second command.
     - You should now be abl;e to run the version commands to ensure bothnode and npm are installed. ```node -v``` and ```npm -v```.
2. This command will set the HOME global variable:
```
\. "$HOME/.nvm/nvm.sh"
```
3. Run this command to install Node.js:
```
nvm install 22
```
4. Run this command after installation to ensure Node.js is installed and check version: (should display version 22)
```
node -v
```
5. Verify npm version: (Should display v10+, but as long as a version displays then you have npm)
```
npm --v
```
**This should be all that is necessary to create a Custom UI. Use the Guides below.**

## Generate a Custom UI & Download Source Code
[Create a Custom UI](/Create-Custom-UI.md)
