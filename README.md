# 🍳 SAVORA AI - Setup Guide

Complete hackathon-ready AI recipe generation platform!

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Google Gemini API Key
- Firebase Account

---

## 🚀 Quick Setup

### 1️⃣ Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Create virtual environment (Mac/Linux)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy .env.example to .env and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here

# Run Flask server
python app.py
```

Backend will run on: `http://localhost:5000`

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Copy the key and paste it in `backend/.env`

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Create Firestore Database
5. Go to Project Settings → Add Web App
6. Copy the config object
7. Paste it in `frontend/src/firebase.js`

Example Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## 📁 Project Structure

```
SavoraAI/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── .env                    # Environment variables
│   ├── requirements.txt        # Python dependencies
│   └── .env.example           # Example env file
│
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── package.json           # NPM dependencies
│   ├── vite.config.js         # Vite configuration
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main app component
│       ├── firebase.js        # Firebase configuration
│       ├── styles.css         # Global styles
│       ├── pages/
│       │   ├── Home.jsx       # Main recipe generation page
│       │   ├── Login.jsx      # Authentication page
│       │   ├── History.jsx    # User recipe history
│       │   └── Favorites.jsx  # Saved favorite recipes
│       └── components/
│           ├── Navbar.jsx     # Navigation bar
│           ├── RecipeCard.jsx # Recipe display card
│           ├── Filters.jsx    # Recipe filters
│           ├── VoiceInput.jsx # Voice-to-text input
│           └── Chatbot.jsx    # AI cooking assistant
```

---

## ✨ Features Implemented

### Core Features
✅ AI-generated dynamic recipes  
✅ Ingredient-based recipe generation  
✅ Step-by-step cooking instructions  
✅ History of previously generated recipes  
✅ Save favorite recipes  

### Smart Features
✅ Multi-cuisine support (Indian, Chinese, Continental, Italian, Mexican, Thai)  
✅ Estimated cooking time  
✅ Portion-based recipe generation (1 person / 2-3 / 4-6 / Family)  
✅ Alternative ingredient suggestions  
✅ AI Chatbot for follow-up cooking questions  
✅ Voice assistant input (browser speech-to-text)  

### Filter Features
✅ Taste filters: Sweet / Savory / Spicy  
✅ Meal type filters: Breakfast / Lunch / Dinner / Snack  
✅ Cuisine filters: Multiple cuisines  
✅ Portion size selection  

---

## 🎯 How to Use

1. **Login/Register**: Create an account or login with Google
2. **Enter Ingredients**: Type or speak ingredients you have
3. **Apply Filters**: Select cuisine, taste, meal type, and portion size
4. **Generate Recipe**: Click "Generate Recipe" button
5. **View Recipe**: See AI-generated recipe with steps and tips
6. **Save Favorite**: Save recipes you love
7. **Ask Chatbot**: Get help with cooking questions
8. **View History**: Access your previously generated recipes

---

## 🐛 Troubleshooting

### Backend won't start
- Make sure virtual environment is activated
- Check if port 5000 is available
- Verify Gemini API key in .env file

### Frontend won't start
- Run `npm install` again
- Delete `node_modules` and run `npm install`
- Check if port 3000 is available

### Firebase errors
- Verify Firebase config in firebase.js
- Enable Authentication methods in Firebase Console
- Check Firestore rules allow read/write

### CORS errors
- Make sure Flask backend is running
- Check flask-cors is installed
- Verify backend URL in frontend (localhost:5000)

---

## 📝 API Endpoints

### POST /generate
Generate a recipe based on ingredients and filters

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "tomatoes"],
  "cuisine": "Indian",
  "taste": "Spicy",
  "mealType": "Dinner",
  "portion": "2-3 people"
}
```

**Response:**
```json
{
  "success": true,
  "recipe": "Formatted recipe text..."
}
```

### POST /chat
Ask follow-up cooking questions

**Request Body:**
```json
{
  "question": "Can I substitute chicken with paneer?",
  "recipeContext": "Full recipe text..."
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Yes, you can substitute..."
}
```

### POST /rescue
Rescue a failed recipe (bonus endpoint)

**Request Body:**
```json
{
  "problem": "My curry is too salty",
  "dishType": "Chicken Curry"
}
```

---

## 🎨 Customization

### Change Theme Colors
Edit `frontend/src/styles.css` and modify:
- Primary color: `#764ba2` (purple)
- Secondary color: `#667eea` (blue)
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Add More Cuisines
Edit `frontend/src/components/Filters.jsx`:
```javascript
const cuisines = ['Any', 'Indian', 'Chinese', 'YOUR_CUISINE'];
```

### Modify AI Prompts
Edit `backend/app.py` to customize how Gemini generates recipes

---

## 🚀 Deployment Tips

### Deploy Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository
3. Add GEMINI_API_KEY environment variable
4. Deploy

### Deploy Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository
3. Add Firebase config as environment variables
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy

---

## 📧 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all API keys are correct
3. Ensure both backend and frontend are running
4. Check browser console for errors

---

## 🎉 You're Ready!

Start the backend, start the frontend, and start cooking with AI! 🍳✨

**Happy Hacking! 🚀**