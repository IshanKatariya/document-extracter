# 🚀 DocuExtract – Intelligent PDF Data Extraction Pipeline

DocuExtract is a **production-ready MVP** for extracting structured data from real-world PDF documents using **Google Gemini AI**, with a strong focus on **accuracy, UX clarity, and future cost optimization**.

> Built as part of an internship assignment to demonstrate **system design thinking**, **AI integration**, and **end-to-end execution**.

---

## 📌 Overview

DocuExtract allows users to:

- Upload single or multiple PDF files
- Track real-time processing status per document
- Automatically classify documents (typed / handwritten)
- Extract structured data using Gemini AI
- View extracted results in a clean dashboard
- Track confidence scores and processing metrics

This project is designed as a **scalable foundation** for large-scale document processing systems.

---

## ✨ Implemented Features (Aligned With Code)

### ✅ Upload Interface
- Drag-and-drop PDF upload
- Multiple file upload supported
- File validation (PDF only)
- Upload queue with per-document status
- Retry and remove failed documents
- Clear progress indicators

### ✅ Processing Pipeline (MVP)
Each document goes through:

1. **Preprocessing (lightweight / simulated)**
   - File validation
   - Architecture ready for image-based preprocessing

2. **Document Classification**
   - Typed vs Handwritten (heuristic-based for MVP)

3. **AI Extraction**
   - Google Gemini API integration
   - Structured JSON extraction
   - Robust JSON parsing & error handling
   - Confidence score returned per document

### ✅ Model Routing (Implemented)
- Typed documents → **Gemini 1.5 Flash**
- Handwritten / Mixed documents → **Gemini 1.5 Pro**

This ensures a balance between **accuracy and cost**.

### ✅ Data Dashboard
- Tabular view of extracted data
- File name visibility
- Confidence score display
- Status indicators (pending / processing / completed / failed)

### ✅ Metrics Dashboard
- Total documents processed
- Success vs failure count
- Model usage breakdown
- Average confidence score
- Processing statistics

---

## 🏗️ Architecture

```
┌─────────────┐
│   Upload    │ → User uploads PDF(s)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Preprocessing  │ → Convert to images, normalize DPI
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Classification  │ → Handwritten vs Typed detection
└──────┬──────────┘
       │
       ├──────────────┬
       │              │              
       ▼              ▼             
  Gemini Pro   Gemini Flash    
       │              │             
       └──────────────┴
                      │
                      ▼
              ┌─────────────┐
              │  Extraction │ → Structured data + confidence
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   Storage   │ → Display in dashboard
              └─────────────┘
```

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide Icons

### Backend
- Next.js API Routes
- Node.js runtime

### AI
- Google Gemini API
  - Gemini 1.5 Flash
  - Gemini 1.5 Pro

---


## 📸 Screenshots

### Upload Interface

<img width="1919" height="1079" alt="Screenshot 2026-02-02 123841" src="https://github.com/user-attachments/assets/a3c5adf9-c8ad-4e67-894a-81eee1706f94" />


### Data Dashboard

<img width="1919" height="1079" alt="Screenshot 2026-02-02 123909" src="https://github.com/user-attachments/assets/470abe1f-75dc-41f4-8ffc-afdc540b17e6" />


### Metrics Overview

<img width="1919" height="1079" alt="Screenshot 2026-02-02 123928" src="https://github.com/user-attachments/assets/8c27ce74-9d76-45d1-8bb2-45008af6c048" />
<img width="1919" height="927" alt="Screenshot 2026-02-02 123944" src="https://github.com/user-attachments/assets/90d77bed-b6e4-4b22-8ba6-a863d917ac80" />


---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Google Gemini API Key

### Installation

```bash
git clone <repository-url>
cd docuextract
npm install
```

### Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open: http://localhost:3000

---

## 📖 Usage Guide

1. Upload PDFs via drag-and-drop
2. Monitor real-time processing status
3. View extracted data in the Data tab
4. Track metrics in the Metrics tab

---

## 💰 Cost Optimization

### Implemented
- Smart model routing (Flash vs Pro)

### Planned / Architecture Ready
- Gemini Batch API integration
- Queue-based processing
- Cost-per-document analytics

---

## 🧪 MVP Limitations

- No persistent database (in-memory state only)
- No real Batch API usage yet
- Document-level confidence only
- Simplified preprocessing pipeline

---

## 🔮 Future Enhancements

- PDF → Image preprocessing (300 DPI)
- Deskewing & noise reduction
- Batch API integration
- Database storage (PostgreSQL / Supabase)
- Field-level confidence scoring
- Manual correction UI

---

## 📬 Submission

**Project**: DocuExtract – Intelligent PDF Data Extractor  
**Developer**: Ishan Katariya  
**Email**: ishankatariya0507@gmail.com  

---


Built with ❤️ using Next.js, TypeScript, and Google Gemini AI
