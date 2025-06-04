### Generate a Custom UI & Download / Configure Source Code
**Summary:** This portion will show you how to create a custom UI within your application, download the source code, and configure a local development environment.
1. Within Automate Studio Modelling, select the **Create Custom UI** option from the UI drop-down header in the left menu.
![alt text](images/custom-ui-select.jpeg "Select Create Custom UI")
2. In the pop-up box, give it a name and optional description.
3. On the Custom UI Configuration page (should automatically navigate to this), select the **“Generate from template <>”** button. The page will generate a template and display a **download source code** button below the configuration details.
4. Select the **download source code** button. A zip file containing the source code for the UI will be downloaded. Place the file on your local machine where you want it and unzip the file. You now have the UI downloaded.
![alt text](images/download-source-code.jpeg "Select Download Source Code button")
5. Release the application containing the custom UI you just downloaded. 
6. Within Studio Admin, deploy the process. On the first tab of the deployment wizard, **select the Enable local development checkbox**. This is necessary in order to run the Custom UI from your local machine during development - VERY IMPORTANT!
7. Once Deployed, from the running Application Instance menu, choose **View Configuration**.
![alt text](images/view-config.jpeg "Select the View Configuration menu item.")
8. Copy all of the JSON code from the configuration window and save it to a notepad / document locally on your machine. You'll use this code later in your local dev environment. 
9. If you have not already, unzip the source code archive you downloaded in step 4. Navigate to and open the file named: **contexts.json5** located at the following directory: ```config\contexts.json5```. Paste over the entire content of this file with the saved JSON configuration from step 8.
10. Open a Terminal window at the root directory of the downloaded source code.
    - Install all the necessary dependencies by running the following command: ```npm i```
    - Set up the environment variables by running the following command: ```npm run setenv```
    - Run the application by running the following command: ```npm start workspace-hxp```
11. Your Custom UI should launch in the web browser. You are now ready to make edits to the Custom UI and view the results from this local dev environment. Being an asynchronous Angular environment, most changes can be made to the files while the UI is running and viewing edited files will automatically update/refresh the UI when an edited file is saved. Good luck!

### Creating a Plugin and a Page
**Summary:** A Plugin Page is a page that loads into the main content window of the UI. This guide will show you how to create and customize your own page and add a button to navigate to that page.
1. **Creating a Plugin** Open a Terminal window at the root directory of the downloaded source code. Paste and execute the command below to have the page created and added to the proper configuration files:
** Replace the bolded portions in the command line with the titles you want to use.**
```
npx nx generate @hyland/extend:plugin --name **page-name** --author "Your Name" --addTranslations true
```
2. **Create a Page** Execute the following command in order to create a page with button added to the left pane to navigate to your page:
** NOTE: You must use the same plug-in name used in step 1 for the plginName in this command (replace the bolded portion). Replace the pageName with the name you want for your page.**
```
npx nx generate @hyland/extend:page --pluginName plugins-**your-plugin-name-used-in-step-1** --pageName **your-page-name**
```
3. 
