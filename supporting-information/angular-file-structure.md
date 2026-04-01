# Angular Workspace Structure (Simplified View)

## 📁 High-Level Layout

---

## 🧠 How to Think About This Structure

### 1. 🏗 Core Application Layer
- **apps/** → Where your actual Angular apps live  
- **libs/** → Shared building blocks used across apps  

👉 Think:  
> "apps use libs to build real features"

---

### 2. 🔄 Build & Runtime Layer
- **dist/** → Final compiled app (what gets deployed)  
- **node_modules/** → All external libraries  

👉 Think:  
> "node_modules builds → dist outputs"

---

### 3. 🧪 Testing Layer
- **e2es/** → Full user journey testing  
- **karma.conf.js / jest.config.ts** → Test frameworks  

👉 Think:  
> "Does the app work correctly?"

---

### 4. ⚙️ Configuration Layer
- **tsconfig*.json** → How TypeScript compiles code  
- **nx.json** → Workspace/project relationships  
- **eslint.config.mjs** → Code quality rules  

👉 Think:  
> "How the project is structured and enforced"

---

### 5. 🛠 Developer Support Layer
- **tools / scripts** → Custom automation  
- **proxy-helpers.js** → API routing in development  
- **config/** → Environment settings  

👉 Think:  
> "Makes development smoother"

---

### 6. 📚 Documentation & Metadata
- **README.md / developer-docs** → Guides and docs  
- **license-header.txt** → Legal info  

👉 Think:  
> "Helps humans understand the project"

---

## 🔹 Simple Mental Model
