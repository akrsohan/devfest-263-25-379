# TenderPack

### Smart Tender Document Checker & Package Generator

TenderPack is a browser-based tender document checking and package generation tool designed to help office staff prepare complete and correctly ordered tender document packages.

The application allows users to load tender requirements, upload PDF documents, match documents with requirements, validate mandatory documents and expiry dates, detect duplicate files, and generate a final combined tender package.

---

## 👤 Participant Information

**Name:** Md Sohan Ali Sorkar  
**Registration ID:** 263-15-379

---

## 🔗 Live Website

**Live Demo:**  
https://devfest-263-15-379.vercel.app/
HTTPS : https://github.com/akrsohan/devfest-263-25-379.git

The website is publicly accessible without requiring login or special permission.

---

## 📖 Problem Statement

Preparing tender documents manually can be difficult because a tender may require multiple documents such as certificates, licenses, financial documents, declarations, and other supporting documents.

Missing a mandatory document, submitting an expired document, accidentally including duplicate documents, or placing documents in the wrong order can cause problems during tender submission.

TenderPack helps reduce these mistakes by checking the uploaded documents against the tender requirements before generating the final package.

---

## ✨ Main Features

### 1. Tender Requirements Loading
- Loads the provided `requirements.json` file.
- Displays tender information including:
  - Tender ID
  - Tender title
  - Procuring entity
  - Bidder
  - Submission deadline
- Displays the required documents in the specified order.

### 2. Multiple PDF Upload
- Supports uploading multiple PDF documents.
- Displays uploaded filenames.
- Displays PDF page counts.
- Allows users to remove uploaded files.
- Rejects unsupported non-PDF files.

### 3. Document Matching
- Matches uploaded PDFs with the required tender documents.
- Supports one-to-one document matching.
- Allows users to change or undo document matches.

### 4. Expiry Date Validation
- Identifies documents that require expiry-date validation.
- Allows users to enter expiry dates.
- Checks expiry dates against the tender submission deadline.
- Same-day expiry as the submission deadline is considered valid.

### 5. Document Status Checking

TenderPack provides clear document statuses such as:

- **OK**
- **Missing**
- **Date Needed**
- **Expired**
- **Not Provided**
- **Duplicate**

Blocking issues are identified before package generation.

### 6. Duplicate Detection
- Detects duplicate PDF files based on identical file content.
- Duplicate files are flagged.
- Duplicate documents cannot be incorrectly matched to different requirements.

### 7. Package Generation Protection
The final package generation button remains disabled while blocking issues exist.

Users are shown the reasons why the package cannot yet be generated.

### 8. Final Tender Package Generation
Once all blocking issues are resolved, TenderPack generates a combined PDF package.

The generated package includes:

- Cover page
- Tender information
- Included documents
- Documents arranged according to the required order
- Original PDF pages preserved
- Page footer with total page count

The final file follows the required naming format:

`<tender_id>_Package.pdf`

Example:

`T-2026-0417_Package.pdf`

### 9. Browser-Based Processing
All document processing is performed directly inside the user's browser.

Tender documents are not uploaded to a participant-controlled backend or database.

### 10. English / Bangla Interface
The application supports switching between English and Bangla for the user interface and document requirement names.

---

## 🎁 Bonus Features

The following bonus features were implemented where applicable:

- Automatic document matching assistance based on filenames
- Bangla document requirement names
- Responsive interface for desktop, tablet and mobile devices
- Duplicate-content detection
- Clear handling of document validation problems

---

## 🛠️ Technologies Used

- React
- TypeScript
- Tailwind CSS
- JavaScript
- PDF.js
- pdf-lib
- Browser File APIs
- SHA-256 hashing

---

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone [YOUR_GITHUB_REPOSITORY_URL]
