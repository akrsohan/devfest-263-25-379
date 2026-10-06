# TenderPack

**Smart Tender Document Checker & Package Generator**

A 100% browser-side, client-only web application designed for office workers and procurement specialists to verify tender documents, audit duplicate PDFs with SHA-256 fingerprints, check submission deadline compliance, match requirements, and assemble an official combined bid package with cover page, table of contents, and universal pagination.

## Features

- **Dynamic Requirements**: Load and validate standard or custom `requirements.json` files.
- **Client-Side Document Auditing**: Fast local processing using Web Crypto API (SHA-256) to detect exact duplicates.
- **Smart Matching & Safeguards**: One-to-one requirement matching with manual overrides and safety validations.
- **Deadline & Expiry Validation**: Verifies validity against submission deadlines.
- **Package Compilation**: Generates `<tender_id>_Package.pdf` with executive cover page, optional index, and non-destructive page footers.
- **Responsive & Bilingual**: Mobile, tablet, and desktop friendly with English and Bengali (বাংলা) support.

## License

This project is licensed under the [MIT License](LICENSE).
