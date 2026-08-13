# CertifyHub — Frontend-Only Certificate Generator & Custom Template Portal

**CertifyHub** is a production-grade, frontend-only Certificate Generator, Custom Visual Template Editor, and Verification Web Application built for colleges, universities, corporate event organizers, hackathons, and training institutions. It allows administrators to create events, manage participant rosters (manually or via CSV import), design/import certificate templates, generate individual or bulk A4 PDF certificates with QR codes entirely in the browser, track audit history, and verify credential authenticity.

> [!IMPORTANT]
> **Frontend Demonstration Notice:** This application operates entirely within the browser. Data persistence is powered by `localStorage` (`certifyhub:v1:`) and IndexedDB (`CertifyHubDB_v1`). Certificate QR codes link to client-side verification routes. No real database, backend server, payment gateway, or email delivery service is connected.

---

## 1. Custom Template Creation Methods

CertifyHub offers **four clear template creation methods** on the Templates page (`/templates`):

### Method 1: Built-in Templates
- 4 vector code-based themes: **Modern Blue**, **Classic Gold**, **Minimal Green**, **Academic Maroon**.
- Built with React components and vector styling for instant selection and preview.

### Method 2: Import a Certificate Design (Canva / Figma / PDF)
- Upload blank certificate design backgrounds exported from **Canva**, **Figma**, **PowerPoint**, **Photoshop**, or **Illustrator**.
- Supported formats: **PNG**, **JPG/JPEG**, **WebP**, and **Single-Page PDF**.
- Automatically detects orientation (A4 Landscape / Portrait).
- Includes **Copyright Confirmation Checkbox**: *"I confirm that I own this design or have permission to use it."*

#### Canva Workflow Instructions:
1. Design your certificate layout in Canva or Figma.
2. Remove sample recipient names, registration numbers, or dates (keep borders, background artwork, and fixed text).
3. Export the blank design as a high-resolution PNG or single-page PDF.
4. Upload the file into CertifyHub using **Import Canva / Figma**.
5. Confirm design ownership and position dynamic placeholders (e.g. `{{recipient.name}}`, `{{event.name}}`, QR code).
6. Save the template and generate personalized certificates for hundreds of participants!

### Method 3: Create From Scratch
- Opens a blank A4 canvas inside our **Canva-like Visual Certificate Editor**.
- Place vector shapes, borders, text headings, dynamic placeholders, signatures, and QR codes.

### Method 4: Smart Design Assistant (Frontend Demo)
- Enter your certificate purpose, style (*Academic*, *Modern*, *Minimal*, *Corporate*, *Gold*), orientation, and color palette.
- Generates 3 editable local template variations using deterministic layout rules.
- **Frontend AI Limitation Notice:** Clearly labeled as a local rule-based layout generator. Connected to a clean `TemplateDesignProvider` abstraction interface so real generative AI models can be plugged in via a secure backend later.

---

## 2. Imported Template Explanation & Text Masking

- **Flat Image Graphics:** Uploaded JPG, PNG, and PDF files serve as canvas background images. Existing text inside flat images is not directly editable.
- **Dynamic Field Overlay:** Dynamic placeholders (`{{recipient.name}}`, `{{event.name}}`, etc.) are placed on layers over the background graphic.
- **Text Masking Tool:** If an imported image contains pre-printed sample text, users can add a **White Masking Rectangle** over the old text directly in the visual editor.

---

## 3. Canva-like Visual Certificate Editor (`/templates`)

- **Top Toolbar:** Undo (`Ctrl+Z`), Redo (`Ctrl+Shift+Z`), Zoom (In/Out/Fit), Preview mode, Download test PDF, Save (`Ctrl+S`), Exit.
- **Left Sidebar:** Add Dynamic Fields, Text Headings/Body, Vector Shapes (Rectangle, Circle, Line), White Masking Box, Logos, Signatures, QR Code, Canvas Background Upload & Color.
- **Central Canvas:** A4 Landscape (`842 x 595 pt`) / Portrait (`595 x 842 pt`) stage with drag, resize, rotate handles, snap guides, and print-safe margin boundaries.
- **Right Properties Inspector:** Modify font family, font size, weight (bold/normal), style (italic), fill color, text alignment, shape stroke/fill, QR colors, opacity, and transform coordinates.
- **Layers Panel:** Element list ordered by z-index, bring forward/send backward, lock, hide, duplicate, delete.
- **Keyboard Shortcuts:** `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Ctrl+C` (Copy), `Ctrl+V` (Paste), `Ctrl+D` (Duplicate), `Delete` (Remove), Arrow Keys (+ `Shift` for 10px), `Escape`.

---

## 4. Browser Storage Architecture (IndexedDB + LocalStorage)

- **Metadata (`localStorage`):** Template names, categories, orientation, and element definitions stored under `certifyhub:v1:custom_templates`.
- **Large Assets (`IndexedDB`):** Heavy background images, thumbnails, and logo Data URLs stored in browser `IndexedDB` (`CertifyHubDB_v1`). This prevents `QuotaExceededError` exceptions.
- **Package Export/Import:** Custom templates can be exported as a `.json` package (containing layout JSON and base64 assets) and imported into another browser session.

---

## 5. Technology Stack

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS, Lucide React Icons
- **Canvas Editor Engine:** `konva`, `react-konva`
- **PDF Generation:** `pdf-lib` (Vector custom template PDF rendering) & `@react-pdf/renderer`
- **PDF Background Import:** `pdfjs-dist` (Client-side single-page PDF background rendering)
- **QR Code Engine:** `qrcode`
- **CSV Processing:** Papa Parse
- **Bulk Download:** JSZip & FileSaver
- **Storage Layer:** Versioned `localStorage` + `IndexedDB` (`idb`)
- **Testing:** Vitest & React Testing Library

---

## 6. Development & Testing Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Automated Unit Tests
```bash
npm test
```

### Type Checking
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
npm run start
```
