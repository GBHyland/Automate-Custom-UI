### Generate a Custom UI & Download / Configure Source Code

**Disclaimer:** 
- Ensure you have instaled nvm and Node.js by following the steps in the [ReadMe](/README.md) page.
- Using Visual Studio Code is strongly recommended since you'll be editing .html, .ts and .json files. You'll also need to use a Terminal window and VS Code allows you to open a terminal window from within the app to run necessary commands and provides a convenient dev experience.

**Summary:** This portion will show you how to create a custom UI within your application, download the source code, and configure a local development environment.
1. Within Automate Studio Modelling, select the **Create Custom UI** option from the UI drop-down header in the left menu.
![alt text](images/custom-ui-select.jpeg "Select Create Custom UI")
2. In the pop-up box, give it a name and optional description.
3. On the Custom UI Configuration page (should automatically navigate to this), select the **“Generate from template <>”** button. The page will generate a template and display a **download source code** button below the configuration details.
4. Select the **download source code** button. A zip file containing the source code for the UI will be downloaded. Place the file on your local machine where you want it and unzip the file. You now have the UI downloaded.
![alt text](images/download-source-code.jpeg "Select Download Source Code button")
5. Release the application containing the custom UI you just downloaded. 
6. Within Studio Admin, deploy the process. On the first tab of the deployment wizard, **select the Enable local development checkbox**. This is necessary in order to run the Custom UI from your local machine during development - VERY IMPORTANT!
7. Once Deployed, from the running Application Instance menu, choose **Development Configuration**.
![alt text](images/view-config.jpeg "Select the View Configuration menu item.")
8. Use the **Copy as JSON** hyperlink on the popup window to copy the config as JSON to your clipboard and save it to a notepad / document locally on your machine. You'll use this code later in your local dev environment. 
9. If you have not already, unzip the source code archive you downloaded in step 4. Navigate to and open the file named: **contexts.json5** located at the following directory: ```config\contexts.json5```. Paste over the entire content of this file with the saved JSON configuration from step 8.
10. Open a Terminal window at the root directory of the downloaded source code.
    - Install all the necessary dependencies by running the following command: ```npm i```
    - Set up the environment variables by running the following command: ```npm run setenv```
    - Run the application by running the following command: ```npm start workspace-hxp```
      - Once building the UI is complete it should launch automatically in a browser window, but in case it does not you can view the UI manually by opening your browser and navigating to this address: ```http://localhost:4200/```
11. Your Custom UI should launch in the web browser and will look like the default UI. You are now ready to make edits to the Custom UI and view the results from this local dev environment. Some things to note:
    - You can stop the local environment from running by pressing CTRL+C in the terminal window.
    - Being an asynchronous Angular environment, most changes can be made to the files while the UI is running and viewing edited files will automatically update/refresh the UI when an edited file is saved. Good luck!

### Creating a Plugin and a Page
**Summary:** A Plugin is first necessary in order to create a Page, so don't skip step 1. A Page loads into the main content window of the UI. This guide will show you how to create and customize your own page and add a button for navigation.
1. **Creating a Plugin** Open a Terminal window at the root directory of the downloaded source code (if not already open from the previous section). Paste and execute the command below to have the page created and added to the proper configuration files:
** Replace the text "yourpluginname" in this command line with the title you want to use.** (In my example, I used the plugin and page names "coffee-time". For simplicity, you can use the same names or use your own if you'd prefer.)
```
npx nx generate @hyland/extend:plugin --name yourpluginname --author "Your Name" --addTranslations true
```
   - The Plugin created will not have any noticeable functionality, but will add configuration to the correct files to support the page you'll create in step 2.
2. **Create a Page** Execute the following command in order to create a page with button added to the left pane to navigate to your page:
** NOTE: You must replace the text "pluginname" in this code with the same plug-in name used in step 1 **AND** replace the text "pagename" with the formal name of the page you want to create. (For simplicity you may use the name "coffee-time" that I used in this example.)**
```
npx nx generate @hyland/extend:page --pluginName pluginname --pageName pagename
```
3. Run the build command in order to test that your plugin page is working. You should see a new button at the bottom of the left hand navigation pane with the name of the page you specified. Click the button and you'll see a generic message in the main content pane that the plugin is working.
```
npm start workspace-hxp
```
4. If your page is working, navigate back to terminal and stop the instance using CTRL+C.
5. The plugin generator created new files for this plugin, which can be found at the following directory. Open finder/explorer and navigate to this directory: ```libs/plugins/**your plugin name**/src/lib/pages/yourpagename```.
   - You should see a few files here: ```yourpagename-menu-item.components.ts```, ```yourpagename-compnents.ts```, and ```yourpagename-module.ts```.
6. Next, you'll need to create a few new files in this directory and paste some html code into those files. I found it easiest to use Visual Studio to create a new file and save to this folder. **NOTE:** Replace all instances of the text "yourpagename" with the actual page name you used in Step 2. Follow these steps in VS:
   - Create a new file and save it in the directory in **step 5** as: ```yourpagename-menu-item.component.scss```. Leave the contents of this file empty. 
   - Create a new file and save it in the directory in **step 5** as: ```yourpagename-menu-item.component.html```.
   - Open the file in that same directory that is titled: ```yourpagename-menu-item.component.ts``` in Visual Studio. In this file, you'll notice a string of HTML code that is surrounded by a single quote (literal string) which is the value of the "template" object. Copy the code between the single quotes, **do not copy the quotes**, and paste the code into the newly created .html file from the step above. (See this screenshot as an example of what to copy).
![alt text](images/copy-html-code.jpeg "Copy selected code.")
     - Inside of the ```yourpagename-menu-item.component.ts``` file, you will replace the template object with the following 2 lines of code, ensuring that you use **your page names** in these lines. Refer to the before and after images below:
code:
```
    templateUrl: './yourpagename-menu-item.component.html',
    styleUrls: ['./yourpagename-menu-item.component.scss'],
```

* This is the code you will replace:
![alt text](images/replace-template.jpeg "Replace this selected code.")

* This what it should look like afterward (but using your page names in place of "coffee-time" in this image):
![alt text](images/replace-template-2.jpeg "Your code should look like this.")

   - Create a new file and save it in the directory in **step 5** as: ```yourpagename-component.scss```. Leave the contents of this file blank.
   - Create a new file and save it in the directory in **step 5** as: ```yourpagename-component.html```. 
   - Next, we will edit the component file that will reference the html & css files we created as well as add the functionality to launch a page and start a process. Open the file in this same directory titled: ```yourpagename.component.ts```.
     - In this file, you will replace the **template** and **selector** properties from the @Component with two properties for **templateUrl** and **styleUrls** with relative paths to the html and style sheet files that you just created using the following code. 
```
    templateUrl: './yourpagename-component.html',
    styleUrls: ['./yourpagename-component.scss'],
```
     - Next, at the top of the file, add the following import: ```import { Router } from '@angular/router';```.
     - Finally, within the **export class** constructor (inside of the brackets "{}"), add the following code, replacing my page name ("coffee-time") with yours inside of the hard brackets "[]":
```
    constructor(
        private router: Router,
    ) {}

    navigateToPage(): void {
        void this.router.navigate(['/coffee-time']);
    }
```
     - Refer to the screenshot below as to what your file should look like (remembering to replace my page name with yours):
![alt text](images/replace-componentts.jpeg "Your code should look like this.")

7. Open the file you created earlier titled ```yourpagename-component.html``` and add the following code: ```<p>This is working!</p>```.
8. All manual file additions and edits are done for core functionality and you may now test the application.
   - Ensuring all edited files are saved, go back to Terminal and launch the UI using the command: ```npm start workspace-hxp```.
   - When the UI loads, click on the button that appears (your page name) below the navigation on the left-side panel to load your page. You should see the message in the main content pane: ```This is working!```.
   - **If you get any errors** refer to [this page](sanity-check/page-comparisons) in this github and compare your file content to mine to ensure everything is correct, ensuring that you replace all instances of my page name with the page name you used (if other than "coffee-time").
9. Add your custom HTML code to create your new page design:
   - In the ```yourpagename-component.html``` and add the following code. **NOTE:** You MUST replace the ```gb-rest-form``` in the <a href> URL in the code below with the name of the process in your application. 
```
<!-- GB HTML -->
<style>
    .chewy-regular {
        font-family: "Chewy", system-ui;
    }
      
</style>
<div style="width:100%; background-color:azure;">
    <div id="header" style="height: 85px; background-color:rgb(126, 96, 31);">
        
        <div style="float: left;">
            <img style="height: 60px; padding: 10px 20px 0px 40px;" src="https://i.postimg.cc/mgMRM1rf/coffee-logo.png">
        </div>
         
        <div id="header-text" style="padding: 22px 0px 0px 20px;">
            <div class="chewy-regular" style="font-size: 34px; font-weight: bold; color:#ffffff;">Coffee Time!</div>
        </div>
        
    </div>
    <div id="banner" style="height: 800px; text-align: center; background-image: url('https://i.postimg.cc/CxcwNpgS/coffee-shop.jpg'); background-position: center; background-repeat: no-repeat; background-size: cover;">
        <div style="height: 300px;">&nbsp;</div>
        <div style="font-family:Georgia, 'Times New Roman', Times, serif; font-size: 40px; font-weight: bold; color: #FFF; ">COFFEE TIME</div>
        <div style="height: 0px;">&nbsp;</div>
        
        <div style="padding: 22px 14px 20px 14px;">
            <button
            mat-button
            (click)="navigateToPage()"
            style="
                    width: 200px;
                    height: 60px;
                    background-color:#555;
                    border-radius: 10px;
                    border: thin solid #444;
                    text-align: center;
                "
            >
            <a href="http://localhost:4200/#/start-process-cloud?process=gb-rest-form" target="_self" style="color:aliceblue;">
                <span
                style="
                    text-align: center;
                    color: #FFF;
                    font-family: 'Open sans';
                    font-size: 20px;
                    font-weight: bold;
                    color:aliceblue;
                ">ORDER NOW</span>
            </a>
            </button>
        </div>
        <div style="height: 500px;">&nbsp;</div>
    </div>
</div>
```
10. Save the file. Return to Terminal and launch the application once again using the command: ```npm start workspace-hxp```.
    - Selecting your page button should load your html page within the content pane showing a site  

