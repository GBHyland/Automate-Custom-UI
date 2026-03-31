# 📦 ADF App Dependencies — Overview

## 🧠 What Are Dependencies?

Dependencies are **external packages** that an application installs and uses to provide functionality.

> Instead of building everything from scratch, we leverage prebuilt, tested tools.

---

## 🎯 What This Dependency List Is Doing

This `package.json` defines the **toolkit of the application**, combining:

- 🧱 **Angular Framework** → app structure, UI, routing, forms  
- 🗂️ **ADF / Alfresco Packages** → content + process services integration  
- 🎨 **Hyland UI & Design** → branding, icons, design tokens  
- 🔄 **State Management (NgRx)** → structured data flow  
- 🔐 **Auth & API Tools** → secure backend communication  
- ⚙️ **Specialized Libraries** → editors, BPMN modeling, utilities  

> 💡 In short: *This is everything the app needs to function, render, and integrate with enterprise systems.*

---

# 🧩 Dependency Categories

## 1. 🧱 Angular Foundation

**Examples:**
- `@angular/core`
- `@angular/router`
- `@angular/forms`
- `@angular/material`

**What it does:**
- Provides the core framework for building the app

**Why it matters:**
> Without Angular, there is no application structure, UI system, or routing.

---

## 2. 🗂️ ADF / Alfresco Dependencies

**Examples:**
- `@alfresco/adf-core`
- `@alfresco/adf-content-services`
- `@alfresco/adf-process-services-cloud`
- `@alfresco/js-api`

**What it does:**
- Enables interaction with Alfresco Content & Process Services
- Provides prebuilt enterprise UI components and APIs

**Why it matters:**
> This is what transforms a standard Angular app into an **ADF application**.

---

## 3. 🎨 Hyland Design & UI Packages

**Examples:**
- `@hylandsoftware/satori-ui`
- `@hylandsoftware/design-tokens`
- `@hylandsoftware/satori-icons`

**What it does:**
- Provides consistent branding, UI components, and styling

**Why it matters:**
> Ensures the app aligns with Hyland’s design system and user experience.

---

## 4. 🔄 State Management (NgRx)

**Examples:**
- `@ngrx/store`
- `@ngrx/effects`
- `@ngrx/entity`

**What it does:**
- Manages application state in a predictable, scalable way

**Why it matters:**
> Keeps data flow organized in complex enterprise applications.

---

## 5. 🔐 Authentication & API Communication

**Examples:**
- `angular-oauth2-oidc`
- `@azure/msal-browser`
- `apollo-angular`
- `graphql`

**What it does:**
- Handles login, tokens, and secure API communication

**Why it matters:**
> Required for connecting to protected backend services.

---

## 6. ⚙️ Specialized Feature Libraries

### 🧭 Process Modeling
- `bpmn-js`
- `dmn-js`

### ✍️ Content Editing
- `@editorjs/editorjs`

### 🧑‍💻 Developer Tools
- `monaco-editor`
- `pdfjs-dist`

### 🔧 Utilities
- `rxjs`
- `uuid`
- `date-fns`

**What it does:**
- Adds advanced features beyond core framework capabilities

**Why it matters:**
> Enables rich, enterprise-level functionality without custom-building everything.

---

# 🧠 The Big Picture

## ✔️ What
> Dependencies are installed packages that provide functionality your app can import and use.

## ✔️ Why
> We use dependencies to:
- 🚀 Build faster  
- 🔁 Reuse proven solutions  
- 🧩 Integrate with enterprise systems  
- 🧼 Keep code clean and maintainable  

---

# 🏁 ADF-Specific Summary

> An ADF app is built on Angular, but extended with Alfresco-specific dependencies.

- Angular → provides the **framework and UI structure**  
- ADF → provides **content, process, and API integration**  
- Additional libraries → provide **auth, state, UI, and advanced features**

---

# 💬 One-Line Takeaway

> **Dependencies are the building blocks that give an ADF app its framework, integrations, and enterprise capabilities.**