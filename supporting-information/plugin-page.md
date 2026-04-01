# ⚙️ Nx + Hyland Extension Commands Explained

## 🧠 Big Picture

These commands use **Nx generators** (via `npx`) to scaffold new functionality into your application.

- `npx` → Runs the Nx CLI without installing it globally  
- `nx generate` → Creates code from predefined templates (generators)  
- `@hyland/extend:*` → Hyland-provided generators for extending the app  

---

# 🧩 Command 1 — Create a Plugin

```bash
npx nx generate @hyland/extend:plugin --name ninesi --author "Greg Bousley" --addTranslations true
```

## 🔍 What This Does

Creates a **new extension plugin** in your application.

---

## 🧩 Breakdown

- **`npx`**  
  Runs the Nx CLI temporarily

- **`nx generate`**  
  Tells Nx to generate code

- **`@hyland/extend:plugin`**  
  Generator that creates a plugin structure

---

## 🏗️ Options

- **`--name ninesi`**  
  Defines the plugin name (used for folders, identifiers, registration)

- **`--author "Greg Bousley"`**  
  Adds metadata for ownership

- **`--addTranslations true`**  
  Generates translation (i18n) files for the plugin

---

## 🧠 What Gets Created

- Plugin folder structure  
- Module setup  
- Registration wiring  
- Translation files (optional)  

> 💡 Think: “Create a container for extending the app”

---

# 🧩 Command 2 — Create a Page

```bash
npx nx generate @hyland/extend:page --pluginName ninesi --pageName nine-si
```

## 🔍 What This Does

Creates a **new page inside the plugin**.

---

## 🧩 Breakdown

- **`@hyland/extend:page`**  
  Generator that creates a UI page

- **`--pluginName ninesi`**  
  Places the page inside the `ninesi` plugin

- **`--pageName nine-si`**  
  Defines the page name (used for route, component, and file naming)

---

## 🧠 What Gets Created

- Angular component  
- HTML + SCSS files  
- Route configuration  
- Plugin registration updates  

> 💡 Think: “Add a screen (UI page) to the plugin”

---

# 🔁 How These Work Together

### Step 1
```bash
generate plugin
```
Creates the **extension container**

### Step 2
```bash
generate page
```
Adds a **UI feature inside that container**

---

# 🎯 Simple Analogy

- **Plugin** = Extension module  
- **Page** = Screen inside that module  

---

# 💬 One-Line Summary

> The first command creates a plugin (a container for custom functionality), and the second command adds a page to that plugin, generating the UI, routing, and configuration needed to display it in the application.