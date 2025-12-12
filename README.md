# Reporte Ciudadano

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/) [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/) [![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Mobile/Web app for reporting and viewing community issues in Puerto Rico. Built with React Native (Expo), Flask, PostgreSQL, and Docker. Hosted using Heroku and Netlify; live application at https://reporte-ciudadano-uprm.netlify.app/.

## Overview

Reporte Ciudadano is a mobile/web application for submitting and tracking community issues in Puerto Rico. Citizens can create reports with photos, view and interact with a public feed, and follow the status of issues over time. Administrators review, approve, and update reports through an internal management interface.

## Key features

- Submit reports with a title, description, category, photo, and location.
- Browse a public feed where users can search, filter, sort, pin, and rate reports.
- Track progress through the report statuses: open, in_progress, resolved, and denied.
- Receive notifications when your report is reviewed or updated.
- Administrators can review your reports, update their status, and manage user accounts.

## Quick Start

### Prerequisites (local version)

- Node.js (latest version)
- Python (latest version)
- Docker (if the app is still in it's local dev phase)
- Expo CLI (for mobile dev)
- PostgreSQL

1) Clone repository

    ```bash
    git clone https://github.com/uprm-CIIC4151-2025S1-capstone-project/uprm-CIIC4151-2025S1-capstone-project.git
    cd uprm-CIIC4151-2025S1-capstone-project
    ```

2) Backend (local dev) 

    ```bash
    python -m venv venv
    # macOS / Linux
    source venv/bin/activate
    # Windows (PowerShell)
    venv\Scripts\Activate.ps1

    pip install -r requirements.txt
    cp .env.example .env
    # Edit .env with real values, then:
    cd backend
    python flask_application.py
    ```

    Notes:

    - Use the `DATABASE_URL` env var to point to a local or containerized PostgreSQL.
    - .env needs to `modify credentials` in case of discrepancies.

3) Frontend (Expo)

    ```bash
    cd uprm-CIIC4151-2025S1-capstone-project
    npm install
    npx expo start (to run app)
    ```

    Notes:
    
    - Ensure API base URL in frontend runtime config points to backend.
    - For local production, needs backend running `flask_application.py` and modify `utils/api.ts` **needs the BASE URL updated**
    - URL given by flask needs to be here -> **android_url**, **iosUrl**, **webUrl** 

   ``` ts
    const getApiBaseUrl = () => {
      if (DEV) {
        console.log("Platform:", Platform.OS);
        // Android
        if (Platform.OS === "android") {
          const androidUrl = "http://10.0.2.2:5000/"; 
          console.log("Using Android URL:", androidUrl);
          return androidUrl;
        }
    
        // iOS 
        if (Platform.OS === "ios") {
          const iosUrl = "http://192.168.4.49:5000/";
          console.log("Using iOS URL:", iosUrl);
          return iosUrl;
        }
    
        // Web
        const webUrl = "http://localhost:5000/";
        console.log("Using Web URL:", webUrl);
        return webUrl;
      }
    
      // Para producción
      return "https://reporte-ciudadano-15eb46ea2557.herokuapp.com";
    };
    ```

5) Docker

    [Docker Tutorial to set the container](https://sliplane.io/blog/how-to-run-postgres-in-docker)
    
## Configuration

Example backend .env:

```text
HOST="localhost"
USER="<your database username>"
PASSWORD="your database password"
DATABASE="<your database name>"
PORT="<your docker container port number>"
```
## Screenshots

| Home Screen | Report Form | Explore Screen |
|-------------|-----------------|----------------|
| ![Home](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/home.png) | ![Report Form](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/reportForm.png) | ![Explore](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/explore.png) |

| User Profile | Report Details | Settings |
|--------------|----------------|----------|
| ![Profile](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/profile.png) | ![Report Details](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/reportDetails.png) | ![Settings](uprm-CIIC4151-2025S1-capstone-project/assets/images/screenshots/settings.png) |

- Youtube video demo of application
 https://youtube.com/shorts/wGjVKdWKA_M?si=2S3jsVnF2O_8qOp1

## Team Bio

Roles
- Jonathan Rodriguez – Research & API Development 
- Ramphis Lopez – Data & Backend Development
- Manuel Fuertes – Requirements & Integration
  
Contact
- jonathan.rodriguez72@upr.edu
- ramphis.lopez@upr.edu
- manuel.fuertes@upr.edu
