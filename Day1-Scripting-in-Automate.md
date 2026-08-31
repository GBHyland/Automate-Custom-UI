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

> [!NOTE]
> This lab begins with an existing imported process. You are **not** creating the entire process from scratch.

---

# Part 1: Verify Process Origin and File Naming

In this section, you will add logic that determines how the process was started and establishes the policy number used throughout the process.

## Step 1: Add the `create-policy-num` Script Task

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

## Step 2: Add the `update-policy-num` Script Task

Next, add the logic that updates the policy number used by the process.

1. Locate the appropriate point in the existing process where the policy number needs to be updated.
2. Add another **Script Task**.
3. Name the task:

   `update-policy-num`

4. Create a new Script with the same title.
5. Apply the script to the script task.
   

### Configure the Script

1. Select `update-policy-num` script.
2. Paste the provided helper function.  
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
4. Above the helper function, write the conditional logic script to call the function.
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

# Part 2: Add Error Handling

The process currently attempts to create a claim folder. If the expected base claims directory does not exist, the process needs a controlled way to handle the failure.

You will add an error path that informs the user of the problem instead of allowing the process to fail without explanation.

## Step 1: Add an Error Boundary Event

Locate the existing **Create Folder** task.

1. Select the Create Folder task.
2. Add an **Error Boundary Event** to the task.
3. Configure the event to catch:

   `ANY ERROR`

The Error Event should be attached directly to the boundary of the Create Folder task.

Conceptually:

```text
                       +------------------+
                       |  Create Folder   |
                       +------------------+
                                |
                          Normal Process
                                |
                                v

                         [ANY ERROR]
                              |
                              v
                         Human Task
```

> [!IMPORTANT]
> The Error Event must be attached to the **Create Folder** task as a boundary event.

---

## Step 2: Add an Error Notification Human Task

Create a **Human Task** connected to the Error Boundary Event.

The error path should now resemble:

```text
Create Folder
     |
 [ANY ERROR]
     |
     v
 Human Task
```

This task will notify the user that the expected base claim folder could not be found.

---

## Step 3: Add an End Event

Add an **End Event** after the Human Task.

Connect the Human Task to the End Event.

The completed error path should resemble:

```text
Create Folder
     |
 [ANY ERROR]
     |
     v
 Human Task
     |
     v
    End
```

This prevents the process from continuing down the normal claim-processing path after the folder creation failure.

---

## Step 4: Create the Error Notification Form

Create a new form for the Human Task.

Name the form:

`folder-inop-notify`

### Add the Notification Message

Add a **Display Text** field to the form.

Configure the Display Text field to show the following message:

> The base Claim folder '/uidev_claims' could not be found. Mike from accounting might have deleted it again. Ensure this directory exists and try again!

This form is informational. Its purpose is to explain why the process cannot continue.

### Checkpoint

Verify that:

- [ ] An Error Boundary Event is attached to Create Folder.
- [ ] The boundary event catches `ANY ERROR`.
- [ ] The Error Event flows to a Human Task.
- [ ] The Human Task uses the `folder-inop-notify` form.
- [ ] The form contains the required Display Text message.
- [ ] The Human Task flows to an End Event.

---

# Part 3: Support Multiple File Uploads

The current process supports only a single uploaded file.

You will modify the process so that users can attach multiple files to a claim and the process can handle each uploaded file individually.

---

## Step 1: Create the Required Process Variables

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

## Step 2: Modify the `create-claim` Form

Open the existing `create-claim` form.

Locate the current **File Upload** component.

Change the component from:

```text
Single File Upload
```

to:

```text
Multiple File Upload
```

The form must now allow the user to select and upload multiple files.

---

## Step 3: Update the `create-claim` Human Task

Return to the process model and select the existing `create-claim` Human Task.

Update the task's file-related input and output mappings to use:

`var_attachedFile`

The files submitted through the form should now be stored in the `var_attachedFile` process variable.

### Checkpoint

Verify that:

- [ ] The form allows multiple files to be uploaded.
- [ ] `var_attachedFile` is a `contentArray`.
- [ ] The Human Task maps the uploaded files to `var_attachedFile`.

---

# Part 4: Determine Whether Files Need Processing

The process now needs to determine whether any files were uploaded.

If files exist, the process will begin processing them.

If no files exist, the process will skip file processing.

## Step 1: Add a File Check Script Task

Create a new **Script Task** after the appropriate point in the claim creation process.

This Script Task will determine whether files were attached.

### Configure Variable Mapping

Configure the Script Task to use:

**All Input / Output**

This allows the script to work with the process variables required for the file-processing logic.

### Add the Script

1. Open the Script Task configuration.
2. Choose **Add Script from Source**.
3. Paste the provided file-checking script.

The script will determine whether files exist and prepare the variables used by the upcoming gateway.

### Checkpoint

Verify that:

- [ ] The Script Task has been added.
- [ ] Mapping is configured for **All Input / Output**.
- [ ] The supplied source script has been added.
- [ ] The task can access `var_attachedFile`.
- [ ] The task can update the variables used by the file-processing loop.

---

# Part 5: Create the File Processing Gateway

Next, create the routing logic that determines whether another file needs to be processed.

## Step 1: Add an Exclusive Gateway

Add an **Exclusive Gateway** immediately after the file-checking Script Task.

The gateway will have two possible paths:

1. Process a file.
2. End file processing.

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

---

## Step 2: Configure the Move Path

Create a sequence flow from the Exclusive Gateway to the existing **Move Content** task.

Configure the condition for this flow as:

```javascript
var_processFiles == true
```

When `var_processFiles` is `true`, the process should continue to Move Content.

---

## Step 3: Update the Move Content Task

Select the existing **Move Content** task.

Locate the `sourceContent` configuration.

Change its value to:

`doc_fileToMove`

The Move Content task should therefore move the **current individual file**, rather than attempting to move the entire uploaded file collection.

> [!NOTE]
> `var_attachedFile` contains all uploaded files. `doc_fileToMove` contains the single file currently being processed.

---

# Part 6: Add the File Loop

After a file has been moved, the process needs to determine whether another uploaded file remains.

## Step 1: Create the `looping-logic` Script Task

Add a new Script Task after the **Move Content** task.

Name it:

`looping-logic`

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

## Step 2: Configure Variable Mapping

Select the `looping-logic` Script Task.

Configure its variable mapping to:

**All Input / Output**

---

## Step 3: Add the Looping Script

1. Open the Script Task.
2. Choose **Add Script from Source**.
3. Paste the provided looping script.

This script will update the variables required to determine whether another uploaded file needs to be processed.

---

## Step 4: Loop Back to the Gateway

Create a sequence flow from:

`looping-logic`

back to the **Exclusive Gateway**.

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

# Part 7: Configure the End Path

Add an **End Event** to the second output path of the Exclusive Gateway.

Configure this sequence flow as the:

**Default Flow**

Do not add an expression to the default path.

The gateway should behave as follows:

| Gateway Path | Configuration | Result |
|---|---|---|
| Move Content | `var_processFiles == true` | Process the current uploaded file |
| End | Default | No additional files need to be processed |

> [!IMPORTANT]
> The End path should be configured as the **Default Flow**, rather than using a second condition such as `var_processFiles == false`.

---

# Final Process Logic

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

# Final Lab Validation

Before completing the lab, verify each of the following.

## Process Origin and Policy Number

- [ ] `create-policy-num` exists after the Start Event.
- [ ] The supplied source script has been added.
- [ ] Required variable mappings are configured.
- [ ] `update-policy-num` has been added.
- [ ] The supplied update script has been added.

## Error Handling

- [ ] Create Folder has an Error Boundary Event.
- [ ] The Error Event catches `ANY ERROR`.
- [ ] The Error Event routes to a Human Task.
- [ ] The Human Task uses `folder-inop-notify`.
- [ ] The notification form contains the required message.
- [ ] The error path terminates at an End Event.

## File Upload

- [ ] `var_attachedFile` exists as `contentArray`.
- [ ] `doc_fileToMove` exists as `content`.
- [ ] `var_processFiles` exists as `Boolean`.
- [ ] `var_currentIndex` exists as `Integer`.
- [ ] The `create-claim` form supports multiple file uploads.
- [ ] The Human Task uses `var_attachedFile`.

## File Processing

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

# Test the Completed Process

After completing the configuration, save and validate the process.

Test at least the following scenarios:

### Test 1: Claim With No Files

Start the process and submit the claim without attaching a file.

**Expected Result:**  
The process should bypass the Move Content loop and follow the gateway's Default Flow.

### Test 2: Claim With One File

Start the process and attach one file.

**Expected Result:**  
The file should be processed by Move Content and the file-processing loop should complete.

### Test 3: Claim With Multiple Files

Start the process and attach multiple files.

**Expected Result:**  
Each file should be processed individually through the Move Content task until all uploaded files have been handled.

### Test 4: Missing Base Claim Folder

Temporarily test the process under conditions where the `/uidev_claims` folder cannot be located.

**Expected Result:**  
The Create Folder task should trigger its Error Boundary Event and display the `folder-inop-notify` Human Task.

The user should see:

> The base Claim folder '/uidev_claims' could not be found. Mike from accounting might have deleted it again. Ensure this directory exists and try again!

After the notification is completed, the error path should terminate.

---

## Lab Complete

You have completed the imported Automate process.

The process can now:

- Determine and update the policy number.
- Handle a failure when creating the claim folder.
- Accept multiple uploaded files.
- Determine whether files need to be processed.
- Process uploaded files individually.
- Loop until all attached files have been handled.
- Exit file processing when no additional files remain.
