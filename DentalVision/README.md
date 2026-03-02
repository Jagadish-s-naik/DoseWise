# DentalVision 🦷✨

**AI-Powered Dental X-Ray Education Tool**

DentalVision is a complete web application that analyzes dental X-rays using AI, overlays color-coded annotations, and provides plain-language explanations. This is a consumer-facing educational tool designed to help patients understand their dental X-rays better.

![DentalVision Banner](https://via.placeholder.com/1200x400/1E40AF/FFFFFF?text=DentalVision+AI)

## 🎯 Features

- **AI Detection**: Uses YOLOv8 to detect teeth, cavities, fillings, crowns, and other dental conditions
- **Color-Coded Overlays**: Visual bounding boxes with color indicators:
  - 🔴 **Red**: Urgent/High priority (cavities, decay)
  - 🟡 **Yellow**: Watch area/Medium priority
  - 🟢 **Green**: Healthy/Routine checkup
- **Plain Language Explanations**: Claude AI generates easy-to-understand explanations (8th grade reading level)
- **PDF Reports**: Downloadable reports with annotated X-rays and findings
- **Privacy First**: X-rays are processed in real-time and not stored on servers

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **React Konva** for canvas-based image overlays
- **React Dropzone** for file uploads
- **jsPDF** for PDF generation
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Flask** (Python) REST API
- **YOLOv8** (Ultralytics) for dental detection
- **Anthropic Claude API** for explanations
- **Pillow** for image processing
- Fallback to **Roboflow DENTEX** dataset API

## 📁 Project Structure

```
dentalvision/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── DisclaimerBanner.tsx
│   │   │   ├── FindingCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── UploadDropzone.tsx
│   │   │   └── XrayCanvas.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   └── AnalysisPage.tsx
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts        # API client
│   │   │   ├── pdfGenerator.ts
│   │   │   └── utils.ts      # Helper functions
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env                  # Frontend environment variables
│
├── backend/
│   ├── services/
│   │   ├── detector.py       # YOLOv8 detection service
│   │   └── explainer.py      # Claude API explanation service
│   ├── app.py                # Flask application
│   ├── requirements.txt
│   └── .env                  # Backend environment variables
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dentalvision.git
cd dentalvision
```

#### 2. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your API keys:
# CLAUDE_API_KEY=your-claude-api-key
# ROBOFLOW_API_KEY=your-roboflow-key (optional)
```

#### 3. Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# The defaults should work for local development
```

### Running the Application

#### Start Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
python app.py
```

Backend will run on `http://localhost:5000`

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173`

## 🔑 API Keys

### Claude API Key (Required for AI Explanations)

1. Sign up at [Anthropic](https://www.anthropic.com/)
2. Get your API key from the dashboard
3. Add to `backend/.env`: `CLAUDE_API_KEY=sk-ant-xxx`

### Roboflow API Key (Optional - Fallback Detection)

1. Sign up at [Roboflow](https://roboflow.com/)
2. Access the DENTEX dataset
3. Add to `backend/.env`: `ROBOFLOW_API_KEY=xxx`

**Note**: The app runs in demo/mock mode without API keys, generating sample detections and cached explanations.

## 📊 API Endpoints

### `GET /api/health`
Health check endpoint
```json
{
  "status": "ok",
  "version": "1.0.0",
  "services": {
    "detector": true,
    "explainer": true
  }
}
```

### `POST /api/analyze`
Upload and analyze X-ray image
- **Input**: multipart/form-data with `file`
- **Output**: Detection results with bounding boxes

### `POST /api/explain`
Generate explanations for detections
- **Input**: JSON array of detections
- **Output**: Plain-language explanations

## 🎨 Color Coding System

- **RED (#DC2626)**: Urgent/High priority conditions (cavities, decay, infections)
- **YELLOW (#F59E0B)**: Watch areas/Medium priority (cracks, wear, gingivitis)
- **GREEN (#10B981)**: Healthy teeth/Routine checkups

## ⚠️ Disclaimer

**IMPORTANT**: DentalVision is an **educational tool** and NOT a diagnostic medical device. 

- This tool does not replace professional dental care
- Always consult with a licensed dentist for diagnosis and treatment
- Results may not be 100% accurate and depend on image quality
- X-rays are processed in real-time and not stored

## 📦 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build

# Deploy to Vercel
vercel deploy
```

Add environment variable in Vercel dashboard:
- `VITE_API_URL`: Your backend API URL

### Backend (Railway/Render)

1. Create a new project on Railway or Render
2. Connect your GitHub repository
3. Set environment variables:
   - `CLAUDE_API_KEY`
   - `FLASK_ENV=production`
   - `PORT=5000`
4. Deploy automatically from the `backend` directory

## 🧪 Testing

### Test with Sample X-rays

Sample dental X-ray images for testing:
- Healthy teeth
- X-ray with cavity
- X-ray with multiple conditions

Place in `backend/samples/` directory.

### Run Backend Tests

```bash
cd backend
python -m pytest tests/
```

## 📝 Future Enhancements

- [ ] Support for more X-ray types (CBCT, cephalometric)
- [ ] Multi-language support
- [ ] Integration with dental practice management systems
- [ ] Mobile app (React Native)
- [ ] Batch processing for multiple X-rays
- [ ] Comparison view (before/after treatments)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **YOLOv8** by Ultralytics
- **DentalXrayAI** GitHub repository
- **DENTEX** dataset on Roboflow
- **Anthropic Claude** API
- **shadcn/ui** for component inspiration

## 📧 Contact

For questions or support:
- GitHub Issues: [Create an issue](https://github.com/yourusername/dentalvision/issues)
- Email: support@dentalvision.ai

---

**Built with ❤️ for better patient education**
