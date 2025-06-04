### Generate a Custom UI & Download / Configure Source Code
1. Within Automate Studio Modelling, select the **Create Custom UI** option from the UI drop-down header in the left menu.
![alt text](images/custom-ui-select.jpeg "Select Create Custom UI")
2. In the pop-up box, give it a name and optional description.
3. On the Custom UI Configuration page (should automatically navigate to this), select the **“Generate from template <>”** button. The page will generate a template and display a **download source code** button below the configuration details.
4. Select the **download source code** button. A zip file containing the source code for the UI will be downloaded. Place the file on your local machine where you want it and unzip the file. You now have the UI downloaded and may apply edits as you wish.
5. Release the application containing the custom UI you just downloaded. 
6. Within Studio Admin, deploy the process. On the first tab of the deployment wizard, **select the Enable local development checkbox**. This is necessary in order to run the Custom UI from your local machine during development - VERY IMPORTANT!
7. Once Deployed, from the running Application Instance menu, choose **Development Configuration**.
![alt text](images/view-config.jpeg "Select the View Configuration menu item.")
8. Copy all of the JSON code from the configuration window and save it to a notepad / document locally on your machine. You'll use this code later. 
9. If you have not already, unzip the source code archive you downloaded in step 4. Navigate to and open the file named: **contexts.json5** located at the following directory: ```config\contexts.json5```. Paste over the entire content of this file with the saved JSON configuration from step 8.
10. Open a Terminal window at the root directory of the downloaded source code.
    - Install all the necessary dependencies by running the following command: ```npm i```
    - Set up the environment variables by running the following command: ```npm run setenv```
    - Run the application by running the following command: ```npm start workspace-hxp```
11. Your Custom UI should launch in the web browser. You are now ready to make edits to the Custom UI and view the results from this local dev environment. Being an asynchronous Angular environment, most changes can be made to the files while the UI is running and viewing edited files will automatically update/refresh the UI when an edited file is saved. Good luck!

### Creating a Plugin Page
A Plugin Page is a page that loads into the main content window of the page. This guide will show you how to create both a page and a button to navigate to that page.
1. 


