## Lab 1: Add the create-policy-num Script Task

Complete code for the **create-policy-num** script task:
```
// assign the Unix timestamp as the policy number for the var_policyNumber process variable
variables.var_policyNumber = Math.floor(Date.now() / 1000);
```

---  

## Lab 2: Add the update-policy-num Script Task

Complete code for the **update-policy-num** script task:
```
// ============================================
// INSTRUCTOR HANDS-ON TYPING: 
// Use the Helper function to determine if the webhook JSON contains data
// If it does, append add "W" to the Policy Number, else add "F"
// ============================================

// set a reference to our process variables
const policyNum = variables.var_policyNumber;
variables.updatedPolicyNum = policyNum;

// if webhook prepend "W", form prepend "F"
const inbound = variables.var_inboundRequest;

// conditional logid to set the id
let id = "F";
if (hasJsonData(inbound)) {
    id = "W";
}

// add the id to the policy number
variables.updatedPolicyNum = id + policyNum;



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

/*
function hasJsonData(jsonObject) {
    try {
        // Null / undefined
        if (jsonObject === null || jsonObject === undefined) {
            return false;
        }

        // Automate / Java Map-style JSON object
        if (typeof jsonObject.get === "function") {
            if (typeof jsonObject.isEmpty === "function") {
                return !jsonObject.isEmpty();
            }

            if (typeof jsonObject.size === "function") {
                return jsonObject.size() > 0;
            }

            return false;
        }

        // Standard JavaScript JSON object
        if (typeof jsonObject === "object") {
            return Object.keys(jsonObject).length > 0;
        }

        return false;

    } catch (error) {
        // Treat anything unexpected as no usable data
        return false;
    }
}
*/
```

---  

## LAB 3: Error Script Task
Complete code for the **custom-folder-error** script task:
```
// Set the value of customErrorMessage process variable with a custom friendly error message.
variables.customErrorMessage = "The base Claim folder '/uidev_claims' could not be found. Mike from accounting might have deleted it again. Ensure this directory exists and try again!";
```

---  

## LAB 5: Determine Origination of the Process
Complete code for the **validate-origin** script task:
```
// ============================================
// INSTRUCTOR HANDS-ON TYPING: 
// Use the Helper function to determine if the webhook JSON contains data
// If it does, set v_originForm to false, true if the webhook payload variable contains data
// ============================================

// set a reference to our process variables
const inbound = variables.var_inboundRequest;

// Conditional logic: if inbound has data set process variable v_originForm to false
// else set it to true
if (hasJsonData(inbound)) {
    // Inbound data exists = originated externally
    variables.v_originForm = false;
} else {
    // No inbound data = originated from form
    variables.v_originForm = true;
}


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

---  

## LAB 6: Determine Whether Files Need Processing
Complete code for the **check-for-files** script task:
```
t// create a local variable that gets a reference to the var_attachedFile process variable
let attachedFiles = variables.var_attachedFile || [];

if (!Array.isArray(attachedFiles)) {
    attachedFiles = [];
}

// set process variable var_processFiles to True or False; false if process var attachedFiles has no files
variables.var_processFiles = attachedFiles.length > 0;

// set process variable var_currentIndex tp 0 (to start the looping index at the 1st position in the array)
variables.var_currentIndex = 0;

// conditional statement that sets the process var doc_fileToMove to the file in attachedFiles at the current index
if (attachedFiles.length > 0) {
    variables.doc_fileToMove = attachedFiles[0];
} else {
    variables.doc_fileToMove = null;
}
```

---  

## LAB 6: Add the Looping Logic
Complete code for the **loop-logic** script task:
```
// create a local variable called attachedFiles with a reference to the var_attachedFile process variable
let attachedFiles = variables.var_attachedFile || [];

// create a local variable called currentIndex with a reference to the var_currentIndex process variable
let currentIndex = Number(variables.var_currentIndex || 0);

// Increment currentIndex
currentIndex = currentIndex + 1;

// Save updated currentIndex back to the process variable var_currentIndex
variables.var_currentIndex = currentIndex;

// Conditional statement: Have we exceeded the number of indexes within the attachedFiles array?
// if so, set process variable var_processFiles = false
// else set the process variable doc_fileToMove value to the next index of the attachedFiles array
if (currentIndex >= attachedFiles.length) {
    variables.var_processFiles = false;
} else {
    variables.var_processFiles = true;
    variables.doc_fileToMove = attachedFiles[currentIndex];
}
```





