# Automate-Custom-UI

## Apps You Will Need or Want
- Visual Studio Code (or similar code editing app) - (Highly Recommended)
  - Download VSCode [here](https://code.visualstudio.com/download).

## Pre-Requisite Installations (NEEDED)
I will break this guide down into 2 sections, MAC OS users and Windows users. Proceed to the section that applies to you.

### MAC OS:
1. Install Node.js  
   - Open a Terminal Window and enter the following command to install npm:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
2. This command will set the HOME global variable:
```
"$HOME/.nvm/nvm.sh"
```
3. Install NVM: _Run this command in Terminal_
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
**This should be all that is necessary to create a Custom UI. Continue to the Generate a Custom UI Guide at the bottom of the page.**


### Windows:
1. Install Node.js:  
   - Navigate to this url [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
     - On that page, at the top of the code box, use the drop-down selectors to set the following configuration: _Get node.js ```v22.17.0(LTS)``` for ```Windows``` using ```Chocolatey``` with ```npm```_. You will use the commands in the code box to complete the next few steps.
     - Open the **Powershell** application on your machine **in Adminstration Mode**.
     - In Powershell, paste and run the **first** command, which will install node.js.
     - **IMPORTANT**: Close Powershell and re-open in **Admin Mode** after this installs.
     - Paste and run the second command.
     - You should now be able to run the version commands to ensure bothnode and npm are installed. ```node -v``` and ```npm -v```.
2. While still in Powershell, run this command to set the HOME global variable:
```
"$HOME/.nvm/nvm.sh"
```
3. Install NVM: _Complete the following process_
   - Navigate to [this webpage](https://github.com/coreybutler/nvm-windows/releases).
   - Under the latest version of the nvm installer, find the hyperlink that is titled: **nvm-setup.exe**
_Use this screenshot as a guide_
![alt text](images/nvm-windows.jpeg "Select the nvm installer")
   - Run the downloaded .exe file and follow the install wizard.  
**NOTE:** You may now open Visual Studio Code and use the embedded Terminal window within VSCode for an easier experience moving forward. **Be sure to launch VS Code in Administration mode, which will provide the Terminal window with authority to install additional packets later on.** Once VSCode is opened, you can open a terminal window from within the application by selecting **Terminal** from the top drop-down options, then selecting **New Terminal**. The following commands can also be run in Powershell (in Admin mode). 
4. Run this command after installation to ensure Node.js is installed and check version: (should display version 22)
```
node -v
```
5. Verify npm version: (Should display v10+, but as long as a version displays then you have npm)
```
npm --v
```
**This should be all that is necessary to create a Custom UI. Continue to the Generate a Custom UI Guide at the bottom of the page.**


## Continue on to Day 1: Scripting in Automate
[Day 1: Scripting in Automate](/Day1-Scripting-in-Automate.md)
