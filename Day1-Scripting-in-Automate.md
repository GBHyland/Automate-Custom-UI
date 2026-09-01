# Hands-On Lab: Complete the Automate Claims Process

## Overview

In this hands-on lab, you will complete the configuration of an imported **Automate process**.

The starting process already contains the foundation of the workflow. Your job is to finish the process by adding logic for:

- Determining how the process was started
- Creating and updating the policy number
- Handling errors when the claim folder cannot be created
- Supporting multiple file uploads
- Determining whether uploaded files need to be processed
- Looping through uploaded files
- Moving each uploaded file into the appropriate claim folder

This hands-on lab begins with an existing imported process. You are **not** creating the entire process from scratch.

---

## 🧪 LAB 1: Verify Process Origin & File Naming

> [!NOTE]
> **Lab Objective:** Configure the process logic used to establish and update the policy number.

In this lab, you will add the Script Tasks required to determine the process origin and establish the policy number used throughout the process.


### Step 1: Process and Script Task Variables 
In this step we'll add the `create-policy-num` Script Task and edit process variable(s).

1. Open the imported process in **Automate**.
2. Locate the **Start Event**.
3. Add a **Script Task** immediately after the Start Event.
4. Name the Script Task:

   `create-policy-num`

5. Connect the Start Event to `create-policy-num`.

Your process should begin with a flow similar to:

```text
Start
  |
  v
create-policy-num
```

### Configure the Script

1. Select the `create-policy-num` Script Task.
2. Open the script configuration.
3. Type the required logic into the script editor.  

### Configure Variable Mapping

1. Select **Edit Script Variables**.
2. Add a new script variable using the **+ Create Script Variable** button.
3. Add _var_policyNumber_ as a variable, configuration:
   - **Variable Category:** ```Input/Output```
   - **Type:** ```string```
4. Save.

Configure the Script Task to use **variable mapping** for the required process variables.

> [!TIP]
> Verify that the variables required by the script are available to the Script Task before continuing.

1. Select the Script task and set the **Mapping Type** to ```Map Variables```.
2. Set the **input** and **output** to _var_policyNumber_.

### Checkpoint

Before continuing, verify that:

- [ ] The Script Task is named `create-policy-num`.
- [ ] It appears immediately after the Start Event.
- [ ] The provided source script has been added.
- [ ] The required logic has been entered.
- [ ] Variable mapping has been configured.

---

## 🧪 LAB 2: Conditional Logic
> [!NOTE]
> **Lab Objective:** Add a Script Task that uses conditional logic to customize our policy number.

Next, add the logic that updates the policy number used by the process.

1. Add another **Script Task** after the _create-policy-num_ Script Task and before the _create-folder_ Task.
2. Name the task: `update-policy-num`
3. Create a new Script with the same title.
4. Paste the provided helper function:  
```
// =================================================
// INSTRUCTOR HANDS-ON TYPING: 
// Use the Helper function to determine if the webhook JSON contains data
// If it does, append add "W" to the Policy Number, else add "F"
// ===========| START CODE HERE |===================


// ============| END CODE HERE |====================
// PROVIDED Helper: Determine if JSON contains data
// =================================================
function hasJsonData(jsonObject) {
    try {
        // ============================================
        // Null / undefined
        // ============================================
        if (jsonObject === null || jsonObject === undefined) {
            return false;
        }

        // ============================================
        // Automate / Java Map-style JSON object
        // ============================================
        if (typeof jsonObject.get === "function") {

            // Preferred check
            if (typeof jsonObject.isEmpty === "function") {
                return !jsonObject.isEmpty();
            }

            // Fallback check
            if (typeof jsonObject.size === "function") {
                return jsonObject.size() > 0;
            }

            return false;
        }

        // ============================================
        // Standard JavaScript JSON object
        // ============================================
        if (typeof jsonObject === "object") {
            return Object.keys(jsonObject).length > 0;
        }

        return false;

    } catch (error) {
        return false;
    }
}
```
4. Above the helper function, write the conditional logic Javascript to call the function.
5. Save.

> [!IMPORTANT]
> Use the supplied source script as the starting point and type the requested `if` logic manually.

### Checkpoint

Verify that:

- [ ] The Script Task is named `update-policy-num`.
- [ ] The supplied script has been added.
- [ ] The required `if` statement has been entered.
- [ ] The task is connected correctly within the existing process flow.

---

## 🧪 LAB 3: Process changes & Error Handling
> [!NOTE]
> **Lab Objectives:**
> 1. The process currently attempts to create a claim folder. If the expected base claims directory does not exist, the process needs a controlled way to handle the failure. You will add an error path that informs the user of the problem instead of allowing the process to fail without explanation.
> 2. The Custom Folder and Generated Claim Document **names** are too simple and can use some level of customization.

**Created Folder Name Enhancement**
1. Select the Create Folder task.
2. Change the value of the **Name** attribute to: ```claim-${updatedPolicyNum}```.

> [!HINT]
> Using a variable in the dollar-bracket syntax (${}) is called an **expression**, and allows you to invoke the value of a variable.
> Combining string text with an expression is called **Interpolation**, i.e.: ```claim-${updatedPolicyNum}``` outputs to: ```claim-12345```.

**Error Boundary Event for the Create Folder Task**
1. Add an **Intermediate Throw Event** to the _create-folder_ task and use the wrench icon to select an ERROR event.
2. Configure the event to catch: `ANY ERROR`
> [!IMPORTANT]
> The Error Event must be attached to the **Create Folder** task as a boundary event.

**Process Variable We'll Need.**
1. Create a process variable called: ```customErrorMessage```
> [!HINT]
> Creating a variable to store a custom error message allows us to display in a Human Task or send to the error log. 

**Script Task to Set our Custom Error**
1. Create a new **Script Task** and a **New Script**, title them: ```custom-folder-error```
2. In the script entry, set the _customErrorMessage_ process variable to the string: ```The base Claim folder '/uidev_claims' could not be found. Ensure this directory exists and try again!```
3. Set the mapping on the script task to _Map all inputs/outputs variables_.
4. Create a Human task stemming from the _custom-folder-error_ script titled: ```folder-error-notify```
5. Create a form with the same name, ```folder-error-notify``` and attach it to the human task.
6. Open the form and add a **Display Text** Field with id: ```errorMessage```.
7. Go back to process and select the Human task. Assign the _Display Text_ the process variable: ```customErrorMessage```.
8. Add an **End Event** after the Human task.


### Checkpoint

Verify that:

- [ ] An Error Boundary Event is attached to Create Folder.
- [ ] The boundary event catches `ANY ERROR`.
- [ ] The Error Event flows to a Human Task.
- [ ] The Human Task uses the `folder-error-notify` form.
- [ ] The form contains the required Display Text message.
- [ ] The Human Task flows to an End Event.

---

## 🧪 LAB 4: Support Multiple File Uploads
> [!NOTE]
> **Lab Objective:** The current process supports only a single uploaded file. You will modify the process so that users can attach multiple files to a claim and the process can handle each uploaded file individually.

---

### Step 1: Create the Required Process Variables

Create the following process variables:

| Variable | Type | Purpose |
|---|---|---|
| `var_attachedFile` | `contentArray` | Stores the files uploaded by the user |
| `doc_fileToMove` | `content` | Stores the individual file currently being processed |
| `var_processFiles` | `Boolean` | Determines whether another file should be processed |
| `var_currentIndex` | `Integer` | Tracks the current file within the uploaded file collection |

> [!IMPORTANT]
> Pay close attention to the variable types. `var_attachedFile` contains the collection of uploaded files, while `doc_fileToMove` represents **one file** from that collection.

---

### Step 2: Modify the `create-claim` Form

1. Open the existing `create-claim` form.
2. Locate the current **File Upload** component.
3. Change the component from:

```text
Single File Upload
```

to:

```text
Multiple File Upload
```

The form will now allow the user to select and upload multiple files.

---

### Step 3: Update the `create-claim` Human Task

1. Return to the process model and select the existing `create-claim` Human Task.
2. Update the task's file-related input and output mappings to use:

`var_attachedFile`

The files submitted through the form should now be stored in the `var_attachedFile` process variable.

### Checkpoint

Verify that:

- [ ] The form allows multiple files to be uploaded.
- [ ] `var_attachedFile` is a `contentArray`.
- [ ] The Human Task maps the uploaded files to `var_attachedFile`.

---

## 🧪 LAB 5: Determine Origination of the Process (Webhook or Manual Form Entry)
> [!NOTE]
> **Lab Objective:** This process can be started from a webhook HTTP call from the **9 Second Insurance Website** or **Manually**. We need a method, at runtime, to determine how the process was started since the file handling is different for each origination.

**Add the _validate-origin_ Script Task**
1. Create a new **Script Task** and **Script Object** titled: `validate-origin`.
2. Place the script task after the _create-folder_ task and before the _gateway_.
3. Configure the mapping to: **Map all inputs/outputs variables**
4. Add the following script template and fill in the rest of the Javascript necessary.
```
// ============================================
// INSTRUCTOR HANDS-ON TYPING: 
// Use the Helper function to determine if the webhook JSON contains data
// If it does, set v_originForm to false, true if the webhook payload variable contains data
// ============================================

// set a reference to our process variables


// Conditional logic: if inbound has data set process variable v_originForm to false
// else set it to true



// ============================================
// Helper: Determine if JSON contains data
// ============================================
function hasJsonData(jsonObject) {
    try {
        // ============================================
        // Null / undefined
        // ============================================
        if (jsonObject === null || jsonObject === undefined) {
            return false;
        }

        // ============================================
        // Automate / Java Map-style JSON object
        // ============================================
        if (typeof jsonObject.get === "function") {

            // Preferred check
            if (typeof jsonObject.isEmpty === "function") {
                return !jsonObject.isEmpty();
            }

            // Fallback check
            if (typeof jsonObject.size === "function") {
                return jsonObject.size() > 0;
            }

            return false;
        }

        // ============================================
        // Standard JavaScript JSON object
        // ============================================
        if (typeof jsonObject === "object") {
            return Object.keys(jsonObject).length > 0;
        }

        return false;

    } catch (error) {
        return false;
    }
}
```

> [!IMPORTANT]
> The following Gateway and sequence flow lines are already configured to refer to the process variable _v_originForm_ to flow in the correct direction based on the setting of the script.

---  

## 🧪 LAB 6: Establish the Looping Mechanism to move the uploaded files
> [!NOTE]
> **Lab Objective:** We'll create the looping mechanism to grab each file uploaded in the manual form process. This will need two script tasks: _check-for-files_ and _looping-logic_. 
> The process now needs to determine whether any files were uploaded.
> - If files exist, the process will begin processing them.
> - If no files exist, the process will skip file processing.

**Add a File Check Script Task**. 
1. Create a new **Script Task** after the _create-claim-doc_ task and before the _move-file_ task; title it: ```check-for-files```.
2. Create a new **Script** with the same name.
3. Configure the Script Task to use: **All Input / Output**
4. Open the Script Task configuration.
5. Add the following script template and write the Javascript to perform these actions. The script will determine whether files exist and prepare the variables used by the upcoming gateway.
```
// 1. create a local variable that gets a reference to the var_attachedFile process variable


// 2. set process variable var_processFiles to True or False; false if process var attachedFiles has no files


// 3. conditional statement that sets the process var doc_fileToMove to the file in attachedFiles at the current index

```

### Checkpoint

Verify that:

- [ ] The Script Task has been added.
- [ ] Mapping is configured for **All Input / Output**.
- [ ] The supplied source script has been written / added.

---

**Create the File Processing Gateway**
Next, we'll create the routing logic that determines whether another file needs to be processed.

1. Add an **Exclusive Gateway** immediately after the file-checking Script Task and before the _move-file_ task.

The gateway will have two possible paths:
- Process a file.
- End file processing.

Conceptually:

```text
                    +--------------------+
                    | Check Attachments  |
                    +--------------------+
                              |
                              v
                       < File Gateway >
                         /          \
                        /            \
              Process File          Default
                    |                  |
                    v                  v
              Move Content            End
```


**Configure the Move Path**
1. Create a sequence flow from the Exclusive Gateway to the existing **Move Content** task (if not already there).
2. Configure the condition for this flow as: `var_processFiles` == **true**

When `var_processFiles` is `true`, the process should continue to Move Content.


**Update the Move Content Task**
1. Select the existing **Move Content** task.
2. Locate the `sourceContent` configuration.
3. Change its value to: `doc_fileToMove`
 
> [!NOTE]
> `var_attachedFile` contains all uploaded files. `doc_fileToMove` contains the single file currently being processed.
> The Move Content task should now move the **current individual file** in the var_attachedFile array, rather than moving the single file.

---

**Add the File Looping Logic Script**
After a file has been moved, the process needs to determine whether another uploaded file remains.

1. Add a new Script Task after the **Move Content** task. Name it: `looping-logic`
2. Configure its variable mapping to: _Map all inputs/outputs variables_.

The flow should now resemble:

```text
Exclusive Gateway
       |
       | var_processFiles == true
       v
 Move Content
       |
       v
 looping-logic
```


---

**Add the Looping Script**
1. Create a new **Script Task** and **Script element**, both titled ```loop-logic```.
2. Set the script task mapping to: ```Map all inputs/outputs variables```.
3. Paste the following script template and write in the necessary Javascript to complete the tasks. This script will update the variables required to determine whether another uploaded file needs to be processed.
```
// create a local variable called attachedFiles with a reference to the var_attachedFile process variable


// create a local variable called currentIndex with a reference to the var_currentIndex process variable


// Increment currentIndex


// Save updated currentIndex back to the process variable var_currentIndex


// Conditional statement: Have we exceeded the number of indexes within the attachedFiles array?
// if so, set process variable var_processFiles = false
// else set the process variable doc_fileToMove value to the next index of the attachedFiles array

```


**Loop Back to the Gateway**
1. Create a sequence flow from the _looping-logic_ script task back to the _Exclusive Gateway_.
The resulting loop should resemble:

```text
                  < Exclusive Gateway >
                    /              \
                   /                \
      processFiles == true         Default
                 |                    |
                 v                    v
          Move Content              End
                 |
                 v
          looping-logic
                 |
                 +--------------------+
                        Loop Back
```

Each time the process returns to the gateway, `var_processFiles` is evaluated again.

---

**Configure the End Path**
1. Add an **End Event** to the second output path of the Exclusive Gateway.
2. Configure this sequence flow as the: **Default Flow**

The gateway should behave as follows:

| Gateway Path | Configuration | Result |
|---|---|---|
| Move Content | `var_processFiles == true` | Process the current uploaded file |
| End | Default | No additional files need to be processed |

> [!IMPORTANT]
> The End path should be configured as the **Default Flow**, rather than using a second condition such as `var_processFiles == false`.

---

## Final Process Logic

When complete, the file-processing portion of the process should operate conceptually like this:

```text
                         create-claim
                              |
                              v
                       Check Attachments
                              |
                              v
                     < Exclusive Gateway >
                       /              \
                      /                \
   var_processFiles == true           Default
                    |                    |
                    v                    v
              Move Content             End
                    |
                    v
              looping-logic
                    |
                    |
                    +-----------> Gateway
```

The overall behavior is:

1. The user submits the claim.
2. Uploaded files are stored in `var_attachedFile`.
3. The file-checking script determines whether files need to be processed.
4. The gateway evaluates `var_processFiles`.
5. If `true`, `doc_fileToMove` is moved.
6. `looping-logic` advances the file-processing logic.
7. The process returns to the gateway.
8. The cycle repeats while files remain.
9. When no additional files need to be processed, the gateway follows its Default Flow.
10. File processing ends.

---

## 🧪 LAB 7: Additional Error Handling
> [!NOTE]
> **Lab Objective:** Next we'll add additional error handling where it makes sense.

**Add error handling (failure protection) to the _update-vars_ script (webhook path)**
If this script fails then the process should not continue. However, we've created a folder for this claim, so if the process is closed at this point, we should remove the folder.

1. Add a **Intermediate throwing event** to the _update-vars_ task.
2. Use the wrench icon to configure it as an **Error Event**.
3. In the **Error** drop-down, elect: `Any error`.
4. Add a **Delete Content Task** after the script task, but ensure a sequence flow line flows from the boundary error event to the _Delete Content Task_.
5. Assign **doc_folder** process variable to the _Content_ attribute.
6. Add an **End Event** flowing from the _Delete Content Task_.

---  

## Final Lab Validations
Before completing the lab, verify each of the following.

### Process Origin and Policy Number
- [ ] `create-policy-num` exists after the Start Event.
- [ ] The supplied source script has been added.
- [ ] Required variable mappings are configured.
- [ ] `update-policy-num` has been added.
- [ ] The supplied update script has been added.

### Error Handling
- [ ] Create Folder has an Error Boundary Event.
- [ ] The Error Event catches `ANY ERROR`.
- [ ] The Error Event routes to a Human Task.
- [ ] The Human Task uses `folder-inop-notify`.
- [ ] The notification form contains the required message.
- [ ] The error path terminates at an End Event.

### File Upload
- [ ] `var_attachedFile` exists as `contentArray`.
- [ ] `doc_fileToMove` exists as `content`.
- [ ] `var_processFiles` exists as `Boolean`.
- [ ] `var_currentIndex` exists as `Integer`.
- [ ] The `create-claim` form supports multiple file uploads.
- [ ] The Human Task uses `var_attachedFile`.

### File Processing
- [ ] The file-checking Script Task has been added.
- [ ] The Script Task uses **All Input / Output** mapping.
- [ ] An Exclusive Gateway follows the file-checking logic.
- [ ] The Move Content path uses `var_processFiles == true`.
- [ ] Move Content uses `doc_fileToMove` as `sourceContent`.
- [ ] `looping-logic` follows Move Content.
- [ ] `looping-logic` uses **All Input / Output** mapping.
- [ ] `looping-logic` returns to the Exclusive Gateway.
- [ ] The second gateway path is configured as the Default Flow.
- [ ] The Default Flow terminates at an End Event.

---

## Test the Completed Process
After completing the configuration, save and validate the process.

Test at least the following scenarios:

> [!NOTE]
>
> ### 🧪 Test 1: Claim With No Files
>
> Start the process and submit the claim **without attaching a file**.
>
> **✅ Expected Result:**
> The process should bypass the **Move Content** loop and follow the gateway's **Default Flow**.


---  


> [!NOTE]
>
> ### 🧪 Test 2: Claim With One File
>
> Start the process and attach one file.
>
> **✅ Expected Result:**
> The file should be processed by Move Content and the file-processing loop should complete.


---  


> [!NOTE]
>
> ### 🧪 Test 3: Claim With Multiple Files
>
> Start the process and attach multiple files.
>
> **✅ Expected Result:**
> Each file should be processed individually through the Move Content task until all uploaded files have been handled.


---  

> [!NOTE]
>
> ### 🧪 Test 4: Missing Base Claim Folder
>
> Temporarily test the process under conditions where the `/uidev_claims` folder cannot be located.
>
> **✅ Expected Result:**
> The Create Folder task should trigger its Error Boundary Event and display the `folder-inop-notify` Human Task.


---

## Hands-on Lab Complete
You have completed the imported Automate process.

The process can now:
- Determine and update the policy number.
- Handle a failure when creating the claim folder.
- Accept multiple uploaded files.
- Determine whether files need to be processed.
- Process uploaded files individually.
- Loop until all attached files have been handled.
- Exit file processing when no additional files remain.
