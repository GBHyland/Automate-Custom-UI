## Lab 1: Add the create-policy-num Script Task

Complete code for the **create-policy-num** script task:
```
// assign the Unix timestamp as the policy number for the var_policyNumber process variable
variables.var_policyNumber = Math.floor(Date.now() / 1000);
```

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


## LAB 3: Error Script Task
Complete code for the **custom-folder-error** script task:
```
// Set the value of customErrorMessage process variable with a custom friendly error message.
variables.customErrorMessage = "The base Claim folder '/uidev_claims' could not be found. Mike from accounting might have deleted it again. Ensure this directory exists and try again!";
```


