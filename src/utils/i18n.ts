import { Language } from '../types/tender';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tenderSummary: string;
  tenderId: string;
  tenderTitle: string;
  procuringEntity: string;
  bidder: string;
  deadline: string;
  readyProgress: string;
  checklistTitle: string;
  checklistSubtitle: string;
  uploadedFilesTitle: string;
  uploadedFilesSubtitle: string;
  dragDropTitle: string;
  dragDropSubtitle: string;
  dragDropLimits: string;
  statusOk: string;
  statusMissing: string;
  statusExpiryNeeded: string;
  statusExpired: string;
  statusNotProvided: string;
  mandatory: string;
  optional: string;
  expiryRequired: string;
  noExpiryNeeded: string;
  checkEverything: string;
  generatePackage: string;
  generatingPackage: string;
  packageBlocked: string;
  packageReady: string;
  duplicateDetected: string;
  duplicateWarning: string;
  unreadablePdf: string;
  autoMatchBtn: string;
  autoMatchApplied: string;
  loadDemoPackBtn: string;
  loadAlternateTenderBtn: string;
  uploadRequirementsBtn: string;
  saveProjectBtn: string;
  savedSuccessfully: string;
  reopenProjectBtn: string;
  resetAllBtn: string;
  exportCsvBtn: string;
  unlinkFile: string;
  matchFilePrompt: string;
  enterExpiryDate: string;
  pagesUnit: string;
  totalSize: string;
  totalFiles: string;
  maxFilesLimit: string;
  maxSizeLimit: string;
  nonPdfRejected: string;
  allClearNotice: string;
  coverPageNotice: string;
  tableOfContentsNotice: string;
  pageFooterNotice: string;
}

export const I18N: Record<Language, Translations> = {
  en: {
    appName: 'TenderPack',
    appSubtitle: 'Smart Tender Document Checker & Package Generator',
    tenderSummary: 'Tender Information Summary',
    tenderId: 'Tender ID / Ref',
    tenderTitle: 'Tender Title',
    procuringEntity: 'Procuring Entity',
    bidder: 'Submitting Bidder',
    deadline: 'Submission Deadline',
    readyProgress: 'Required Documents Ready',
    checklistTitle: 'Tender Requirements & Document Matching',
    checklistSubtitle: 'Verify every required item in order, attach verified PDFs, and check expiration dates.',
    uploadedFilesTitle: 'Uploaded PDF Documents Repository',
    uploadedFilesSubtitle: 'Documents parsed locally in your browser with real page count and SHA-256 duplicate auditing.',
    dragDropTitle: 'Drop PDF files here or click to browse',
    dragDropSubtitle: 'Select up to 30 PDF documents (Max total size: 50 MB)',
    dragDropLimits: 'Only PDF files (.pdf) accepted. Zero server uploads - 100% browser private.',
    statusOk: 'OK',
    statusMissing: 'Missing',
    statusExpiryNeeded: 'Expiry date needed',
    statusExpired: 'Expired',
    statusNotProvided: 'Not provided',
    mandatory: 'Mandatory',
    optional: 'Optional',
    expiryRequired: 'Expiry Required',
    noExpiryNeeded: 'No Expiry Needed',
    checkEverything: 'Check Everything',
    generatePackage: 'Generate Tender Package',
    generatingPackage: 'Assembling Final PDF Package...',
    packageBlocked: 'Package generation is blocked. Please resolve all issues below.',
    packageReady: 'All validation criteria met! Your package is ready to be compiled.',
    duplicateDetected: 'Exact Content Duplicate',
    duplicateWarning: 'Identical file content detected. Duplicate files cannot be included or matched.',
    unreadablePdf: 'Could not read this PDF. Please check that the file is not damaged or password-protected.',
    autoMatchBtn: 'Smart Auto-Match',
    autoMatchApplied: 'Auto-matched documents based on filename similarity!',
    loadDemoPackBtn: 'Load Demo Test Files',
    loadAlternateTenderBtn: 'Switch Sample Tender',
    uploadRequirementsBtn: 'Upload requirements.json',
    saveProjectBtn: 'Save Session',
    savedSuccessfully: 'Session state saved locally to browser storage!',
    reopenProjectBtn: 'Load Saved Session',
    resetAllBtn: 'Clear All Files',
    exportCsvBtn: 'Export Checklist (CSV)',
    unlinkFile: 'Unlink File',
    matchFilePrompt: 'Select uploaded PDF...',
    enterExpiryDate: 'Enter document expiry date',
    pagesUnit: 'pages',
    totalSize: 'Total Size',
    totalFiles: 'Files',
    maxFilesLimit: 'Maximum 30 files limit exceeded.',
    maxSizeLimit: 'Maximum 50 MB cumulative file size exceeded.',
    nonPdfRejected: 'Rejected non-PDF file. Only genuine PDF documents are supported.',
    allClearNotice: 'Zero blocking issues. All required documents validated against deadline.',
    coverPageNotice: 'Page 1 will be an official Executive Cover Page.',
    tableOfContentsNotice: 'Page 2 will be a dynamic Table of Contents with starting page numbers.',
    pageFooterNotice: 'All pages will have official <tender_id> | Page X of Y subtle footers.',
  },
  bn: {
    appName: 'TenderPack',
    appSubtitle: 'Smart Tender Document Checker & Package Generator',
    tenderSummary: 'দরপত্রের তথ্যাবলীর সারসংক্ষেপ',
    tenderId: 'দরপত্র আইডি / রেফারেন্স',
    tenderTitle: 'দরপত্রের শিরোনাম',
    procuringEntity: 'ক্রয়কারী কর্তৃপক্ষ',
    bidder: 'দরপত্রদাতা প্রতিষ্ঠান',
    deadline: 'দাখিলের শেষ সময়সীমা',
    readyProgress: 'প্রয়োজনীয় নথি প্রস্তুত সম্পন্ন',
    checklistTitle: 'দরপত্র চাহিদাপত্র ও নথি ম্যাচিং',
    checklistSubtitle: 'ধারাবাহিক ক্রমে প্রতিটি শর্ত পূরণ করুন, যাচাইকৃত পিডিএফ যুক্ত করুন এবং মেয়াদোত্তীর্ণের তারিখ পরীক্ষা করুন।',
    uploadedFilesTitle: 'আপলোডকৃত পিডিএফ নথিপত্র',
    uploadedFilesSubtitle: 'কোনো সার্ভারে না পাঠিয়ে সম্পূর্ণ ব্রাউজারে প্রকৃত পৃষ্ঠা সংখ্যা ও এসএইচএ-২৫৬ ডুপ্লিকেট নিরীক্ষা।',
    dragDropTitle: 'পিডিএফ ফাইল এখানে টেনে আনুন অথবা ক্লিক করে নির্বাচন করুন',
    dragDropSubtitle: 'সর্বোচ্চ ৩০টি পিডিএফ ফাইল নির্বাচন করুন (সর্বোচ্চ মোট সাইজ: ৫০ মেগাবাইট)',
    dragDropLimits: 'কেবলমাত্র পিডিএফ (.pdf) গ্রহণযোগ্য। ব্রাউজারেই ১০০% নিরাপদ প্রসেসিং।',
    statusOk: 'ঠিক আছে (OK)',
    statusMissing: 'অনুপস্থিত (Missing)',
    statusExpiryNeeded: 'মেয়াদের তারিখ প্রয়োজন',
    statusExpired: 'মেয়াদোত্তীর্ণ (Expired)',
    statusNotProvided: 'প্রদান করা হয়নি (Not provided)',
    mandatory: 'বাধ্যতামূলক',
    optional: 'ঐচ্ছিক',
    expiryRequired: 'মেয়াদ যাচাই প্রযোজ্য',
    noExpiryNeeded: 'মেয়াদ যাচাই নেই',
    checkEverything: 'সবকিছু পুনরায় যাচাই করুন (Check Everything)',
    generatePackage: 'চূড়ান্ত প্যাকেজ তৈরি করুন',
    generatingPackage: 'পিডিএফ প্যাকেজ প্রস্তুত হচ্ছে...',
    packageBlocked: 'প্যাকেজ তৈরি করা স্থগিত রয়েছে। অনুগ্রহ করে নিচের সমস্যাগুলো সমাধান করুন।',
    packageReady: 'সকল শর্ত পূরণ হয়েছে! আপনার চূড়ান্ত প্যাকেজ প্রস্তুতের জন্য প্রস্তুত।',
    duplicateDetected: 'হুবহু একই ফাইলের ডুপ্লিকেট',
    duplicateWarning: 'ফাইলের ভেতরের তথ্য হুবহু এক। ডুপ্লিকেট ফাইল দরপত্রে সংযুক্ত করা যাবে না।',
    unreadablePdf: 'এই পিডিএফটি পড়া যায়নি। ফাইলটি ক্ষতিগ্রস্ত বা পাসওয়ার্ডযুক্ত কি না পরীক্ষা করুন।',
    autoMatchBtn: 'স্মার্ট অটো-ম্যাচ',
    autoMatchApplied: 'ফাইলের নামের সাথে মিল রেখে নথি সফলভাবে সংযুক্ত করা হয়েছে!',
    loadDemoPackBtn: 'পরীক্ষামূলক ডেমো ফাইল লোড করুন',
    loadAlternateTenderBtn: 'নমুনা দরপত্র পরিবর্তন করুন',
    uploadRequirementsBtn: 'requirements.json আপলোড করুন',
    saveProjectBtn: 'সেশন সংরক্ষণ করুন',
    savedSuccessfully: 'ব্রাউজারে বর্তমান কাজের সেশন সফলভাবে সংরক্ষিত হয়েছে!',
    reopenProjectBtn: 'সংরক্ষিত সেশন লোড করুন',
    resetAllBtn: 'সব মুছুন',
    exportCsvBtn: 'চেকলিস্ট এক্সপোর্ট (CSV)',
    unlinkFile: 'সংযোগ বিচ্ছিন্ন করুন',
    matchFilePrompt: 'আপলোডকৃত পিডিএফ বাছুন...',
    enterExpiryDate: 'নথির মেয়াদোত্তীর্ণের তারিখ দিন',
    pagesUnit: 'পৃষ্ঠা',
    totalSize: 'মোট সাইজ',
    totalFiles: 'ফাইল সংখ্যা',
    maxFilesLimit: 'সর্বোচ্চ ৩০টি ফাইলের সীমা অতিক্রম করেছে।',
    maxSizeLimit: 'সর্বোচ্চ ৫০ মেগাবাইট ফাইলের মোট সীমা অতিক্রম করেছে।',
    nonPdfRejected: 'অ-পিডিএফ ফাইল প্রত্যাখ্যাত হয়েছে। শুধুমাত্র পিডিএফ ফাইল গ্রহণযোগ্য।',
    allClearNotice: 'কোনো সমস্যা নেই। সমস্ত আবশ্যকীয় নথি যাচাই সম্পন্ন হয়েছে।',
    coverPageNotice: '১ম পৃষ্ঠাটি হবে একটি পেশাদার অফিসিয়াল কভার পেজ।',
    tableOfContentsNotice: '২য় পৃষ্ঠাটি হবে ডায়নামিক সূচিপত্র বা ইনডেক্স।',
    pageFooterNotice: 'প্রতিটি পৃষ্ঠায় অফিসিয়াল <tender_id> | Page X of Y ফুটার যুক্ত হবে।',
  },
};
