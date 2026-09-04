## Lab 1: Add the create-claim-num Script Task

Complete code for the **create-claim-num** script task:
```
// assign the Unix timestamp as the claim number for the var_claimNumber process variable
variables.var_claimNumber = Math.floor(Date.now() / 1000);
```

---  

## Lab 2: Add the update-claim-num Script Task

Complete code for the **update-claim-num** script task:
```
// ============================================
// INSTRUCTOR HANDS-ON TYPING: 
// Use the Helper function to determine if the webhook JSON contains data
// If it does, append add "W" to the Claim Number, else add "F"
// ============================================

// set a local variable called claimNum as a reference to our var_claimNumber process variable
const claimNum = variables.var_claimNumber;

// make process variable updatedClaimNum the value of the claimNum
variables.updatedClaimNum = claimNum;

// if webhook prepend "W", form prepend "F"
const inbound = variables.var_inboundRequest;

// conditional logid to set the id
let id = "F";
if (hasJsonData(inbound)) {
    id = "W";
}

// add the id to the claim number
variables.updatedClaimNum = id + claimNum;



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
// If it does, set process variable v_originForm to false, else true
// ============================================

// create a local variable called inbound with a reference to the process variable var_inboundRequest
const inbound = variables.var_inboundRequest;

// Conditional statement that leverages the hasJsonData helper function to determine if the inbound var has value
// if the inbound var has value, set process var v_originForm to false, else true
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
// create a local variable called attachedFiles that gets a reference to the var_attachedFile process variable
let attachedFiles = variables.var_attachedFile;

// set process variable var_processFiles to True or False
// false if process var attachedFiles has no files 
// (hint: use.length to ensure there's > 0 objects in array)
variables.var_processFiles = attachedFiles.length > 0;

// set process variable var_currentIndex tp 0 
// (to start the looping index at the 1st position in the array)
variables.var_currentIndex = 0;

// write a conditional statement that checks if attachedFiles has > 0 data
// action: sets the process var doc_fileToMove to the variables.var_currentIndex of the attachedFiles array
if (attachedFiles.length > 0) {
    variables.doc_fileToMove = attachedFiles[variables.var_currentIndex];
}
```

---  

## LAB 6: Add the Looping Logic
Complete code for the **loop-logic** script task:
```
// create a local variable called attachedFiles with a reference to the var_attachedFile process variable
let attachedFiles = variables.var_attachedFile;

// create a local variable called currentIndex with a reference to the var_currentIndex process variable
let currentIndex = Number(variables.var_currentIndex);

// Increment currentIndex by 1
currentIndex = currentIndex + 1;

// Save updated currentIndex back to the process variable var_currentIndex
variables.var_currentIndex = currentIndex;

// Write the following Conditional Statement: 
// Has currentIndex exceeded the number of indexes within the attachedFiles array?
// if exceeded, set process variable var_processFiles = false
// else 
//.  (1)set the process variable var_processFiles = true and
//.  (2)doc_fileToMove value to the next index of the attachedFiles array
if (currentIndex >= attachedFiles.length) {
    variables.var_processFiles = false;
} else {
    variables.var_processFiles = true;
    variables.doc_fileToMove = attachedFiles[currentIndex];
}
```

---  

## LAB 7: JSON inbound to process variable mapping
Complete code for the **update-vars** script task:
```
try {
    // ============================================
    // Validate inbound request
    // ============================================
    const inbound = variables.var_inboundRequest;

    if (inbound == null) {
        throw new Error(
            "var_inboundRequest is null or undefined. No inbound request data was received."
        );
    }

    // Check whether inbound contains any data.
    // Handles normal JavaScript objects.
    if (
        typeof inbound === "object" &&
        typeof inbound.get !== "function" &&
        Object.keys(inbound).length === 0
    ) {
        throw new Error(
            "var_inboundRequest exists but contains no data."
        );
    }


    // ============================================
    // Initialize image variables
    // ============================================
    let uploadedImages = [];


    // ============================================
    // EXERCISE: Map inbound data to process variables
    // ============================================
    variables.var_claimNumber = inbound.var_policyNumber;
    variables.var_firstName = inbound.FirstName;
    variables.var_lastName = inbound.LastName;
    variables.var_streetAddress = inbound.StreetAddress;
    variables.var_city = inbound.City;
    variables.var_state = inbound.State;
    variables.var_zip = inbound.Zip;
    variables.var_email = inbound.var_email;

    variables.var_perilType = inbound.DamageType;
    variables.var_perilDate = inbound.DamageDate;
    variables.var_perilDescription = inbound.DamageDescription;


    // ============================================
    // Get uploaded images
    // ============================================
    if (typeof inbound.get === "function") {
        uploadedImages = inbound.get("var_uploadedImages") || [];
    } else {
        uploadedImages = inbound.var_uploadedImages || [];
    }


    // ============================================
    // Make sure uploadedImages is an array
    // ============================================
    if (!Array.isArray(uploadedImages)) {
        uploadedImages = [];
    }


    // ============================================
    // Determine whether images were uploaded
    // ============================================
    const hasImages = uploadedImages.length > 0;

    if (hasImages) {
        variables.var_uploadedFileUrl = uploadedImages[0];
    } else {
        variables.var_uploadedFileUrl = null;
    }


    // ============================================
    // Set image processing flag
    // ============================================
    variables.var_processImage = hasImages;


} catch (error) {

    // ============================================
    // Store useful error information
    // ============================================
    variables.var_scriptError = true;
    variables.var_scriptErrorMessage =
        error && error.message
            ? error.message
            : String(error);

    // Re-throw so Automate marks the Script Task as failed
    throw error;
}
```



