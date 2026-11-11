# MediLens AI — AI-Powered Medical Report Analyzer

MediLens AI is a full-stack medical report analysis platform that helps users upload, understand, review, and manage their medical reports using AI-assisted explanations and intelligent document processing.

The platform combines document extraction, OCR, deterministic medical range classification, AI-powered explanations, and Retrieval-Augmented Generation (RAG) to make medical reports easier to understand.

> **Disclaimer:** MediLens AI is an informational tool, not a substitute for professional medical advice, diagnosis, or treatment.

## Project Overview

MediLens AI provides an integrated platform for processing medical reports and presenting extracted health information through an interactive dashboard.

### Key Features

- **User Authentication:** Secure registration and login using JWT-based authentication and Spring Security.
- **Google OAuth 2.0 Authentication:** Allow users to register and sign in directly using their Google accounts through secure OAuth 2.0 authentication.
- **Medical Report Upload:** Upload PDF medical reports for processing.
- **PDF Text Extraction:** Extract text from digital PDF documents using Apache PDFBox.
- **OCR Processing:** Use Tesseract OCR for scanned medical documents.
- **Medical Data Extraction:** Identify and structure medical test names, values, units, and reference ranges.
- **Extraction Review:** Review and manually correct extracted medical test results.
- **Medical Range Classification:** Classify test results using deterministic reference-range logic.
- **AI-Powered Explanations:** Generate understandable explanations of medical test results.
- **Report Summaries:** Generate AI-assisted summaries of uploaded reports.
- **RAG-Based Report Chat:** Ask questions about individual reports using retrieved report context.
- **Dashboard Analytics:** View key statistics, charts, and report information.
- **Report History:** Access and manage previously uploaded reports.
- **Health Trends:** Visualize changes in test results over time.
- **Export and Print:** Export and print report information.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, Material UI |
| Backend | Java 17, Spring Boot |
| Security | Spring Security, JWT, OAuth 2.0 |
| Authentication | Email/Password Authentication, Google OAuth 2.0 |
| ORM | Hibernate / Spring Data JPA |
| Database | PostgreSQL |
| Database Migration | Flyway |
| PDF Processing | Apache PDFBox |
| OCR | Tesseract OCR |
| AI Service | Python, FastAPI |
| AI Integration | Groq API |
| Embeddings | FastEmbed |
| Vector Search | PostgreSQL with pgvector |
| API Communication | REST APIs |
| Version Control | Git and GitHub |

## System Architecture

```mermaid
flowchart TD
    A[User] --> B[React Frontend]
    B --> C[Spring Boot Backend]

    C --> D[Spring Security and JWT]
    C --> E[Google OAuth 2.0]
    E --> F[Google Authentication]
    F --> C

    C --> G[PostgreSQL Database]
    C --> H[PDF Text Extraction]

    H --> I[Tesseract OCR]
    H --> J[Medical Data Extraction]
    J --> G

    C --> K[Python FastAPI AI Service]
    K --> L[Groq API]
    K --> M[FastEmbed]
    M --> N[PostgreSQL / pgvector]
    N --> K

    K --> C
    C --> B
```

### Authentication Workflow

MediLens AI supports two authentication methods:

**1. Email and Password Authentication**

1. Users register using their name, email address, and password.
2. The backend validates the registration details.
3. User credentials are securely processed and stored.
4. Users log in using their registered email and password.
5. The backend generates a JWT token after successful authentication.
6. The frontend stores and uses the token for authenticated API requests.

**2. Google OAuth 2.0 Authentication**

1. Users select the Sign in with Google or Sign up with Google option.
2. The frontend redirects users to the Spring Boot Google OAuth authorization endpoint.
3. Spring Security redirects users to Google's authentication page.
4. Users authenticate using their Google accounts and grant the requested permissions.
5. Google redirects the authenticated user to the backend OAuth callback.
6. The backend processes the OAuth response through a custom authentication success handler.
7. The backend generates an application authentication token.
8. The frontend receives the token and processes it through `loginWithToken()`.
9. The authentication context stores the token and retrieves the logged-in user's details.
10. Users are redirected to their MediLens dashboard.

Google authentication uses OAuth 2.0 through Spring Security OAuth2 Client.

### Report Processing Workflow

1. The user uploads a medical report through the React frontend.
2. The Spring Boot backend receives and validates the uploaded document.
3. PDFBox extracts text from digital PDFs.
4. Tesseract OCR processes scanned documents when required.
5. The backend extracts structured medical test information.
6. Extracted results are reviewed and classified using reference ranges.
7. The Python AI service generates explanations and report summaries.
8. Report content is embedded and indexed for report-specific RAG conversations.
9. Results are stored in PostgreSQL and displayed on the dashboard.

## Project Structure

```text
MediLens-AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── medilens-ai-service/
│   │   ├── app/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   ├── main.py
│   │   └── requirements.txt
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── docs/
│   └── screenshots/
│       ├── landing-page.png
│       ├── dashboard.png
│       ├── dashboard-analytics.png
│       ├── recent-activity.png
│       ├── report-history.png
│       ├── upload-report.png
│       ├── report-analysis.png
│       └── ai-report-chat.png
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following software before running the application:

- Java Development Kit 17
- Node.js and npm
- Python 3.10 or a compatible version supported by the AI service dependencies
- PostgreSQL
- Tesseract OCR
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Prashanthbkm/MediLens-AI.git
cd MediLens-AI
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE medilens_db;
```

Configure your database credentials using environment variables.

The backend uses Flyway for database migrations.

### 3. Backend Setup — Spring Boot

Navigate to the backend directory:

```bash
cd backend
```

Configure the required environment variables in your local environment:

```env
DB_PASSWORD=your_database_password
JWT_SECRET=your_secure_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the Spring Boot application from the backend directory on Windows:

```cmd
mvnw.cmd spring-boot:run
```

The backend is configured to run on:

```text
http://localhost:8080
```

### 4. Google OAuth 2.0 Configuration

MediLens AI supports Google account authentication through Spring Security OAuth2 Client.

To enable Google Sign-In:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a Google Cloud project.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID.
5. Select Web Application as the application type.
6. Add the following authorized redirect URI for local development:

   ```text
   http://localhost:8080/login/oauth2/code/google
   ```

7. Copy the generated Google Client ID and Client Secret.
8. Configure the following environment variables:

   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

The backend `application.properties` uses environment variable references:

```properties
# Google OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=email,profile
```

Once configured, users can authenticate directly using their Google accounts through the MediLens login and registration pages.

**Security Note:** Never expose your Google Client Secret in frontend code or commit actual credentials to GitHub.

For production deployment, configure the appropriate production redirect URI in Google Cloud Console and update the backend and frontend OAuth redirect configuration accordingly.

### 5. AI Service Setup — Python FastAPI

Navigate to the AI service directory from the repository root:

```bash
cd backend/medilens-ai-service
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```cmd
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file with your AI and database configuration:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=medilens_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_database_password
```

Use the exact environment variable names expected by your AI service configuration.

Start the FastAPI service:

```bash
uvicorn main:app --reload --port 8000
```

AI service URL:

```text
http://localhost:8000
```

### 6. Frontend Setup — React

Open a new terminal from the repository root and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

Ensure that the frontend API configuration points to your running backend.

## Environment Variables and Security

Sensitive configuration must never be committed to GitHub.

Keep the following information private:

- Groq API keys
- Database passwords
- JWT signing secrets
- Google OAuth client secrets
- Production credentials
- User-uploaded medical reports

The repository uses `.gitignore` to exclude environment files, build folders, virtual environments, logs, and uploaded reports.

Create your own local `.env` files when setting up the project. Never commit real `.env` files, API keys, or authentication secrets.

## Screenshots

### 1. Landing Page

![MediLens AI Landing Page](docs/screenshots/landing-page.png)

### 2. Dashboard

![MediLens AI Dashboard](docs/screenshots/dashboard.png)

### 3. Dashboard Analytics

![Dashboard Analytics](docs/screenshots/dashboard-analytics.png)

### 4. Recent Activity

![Recent Activity](docs/screenshots/recent-activity.png)

### 5. Report History

![Report History](docs/screenshots/report-history.png)

### 6. Upload Medical Report

![Upload Medical Report](docs/screenshots/upload-report.png)

### 7. Medical Report Analysis

![Medical Report Analysis](docs/screenshots/report-analysis.png)

### 8. AI Report Chat

![AI Report Chat](docs/screenshots/ai-report-chat.png)

## Future Enhancements

- Production deployment with cloud infrastructure.
- Improved multilingual medical report support.
- Enhanced document extraction accuracy.
- More advanced report comparison and trend analysis.
- Improved report citations and source references.
- Expanded automated testing and monitoring.

## Learning Outcomes

This project demonstrates practical experience with:

- Full-stack application development.
- REST API design and integration.
- JWT authentication and authorization.
- Google OAuth 2.0 authentication.
- Relational database design and migrations.
- PDF processing and OCR.
- AI API integration.
- Embeddings and vector search.
- Retrieval-Augmented Generation (RAG).
- Data visualization and dashboard development.
- Git-based version control.

## Author

**Prashanth B.K.M.**

Full-Stack Developer | Java | Spring Boot | React.js | Python | SQL

GitHub: [@Prashanthbkm](https://github.com/Prashanthbkm)

Project Repository: [MediLens AI](https://github.com/Prashanthbkm/MediLens-AI)

---

**Built with a vision to make medical reports easier to understand through technology.**
