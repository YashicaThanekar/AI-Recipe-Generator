from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import requests

# Load environment variables
load_dotenv(override=True)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure OpenRouter API
api_key = os.getenv('OPENROUTER_API_KEY')
if not api_key or api_key == 'your_actual_api_key_here':
    print("WARNING: OPENROUTER_API_KEY not found or not set correctly in environment variables!")
    print(f"Current value: {api_key}")
else:
    print(f"OPENROUTER_API_KEY loaded successfully (starts with: {api_key[:10]}...)")

# OpenRouter API configuration - Note: use api subdomain
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Try different free models if one doesn't work
MODEL = "meta-llama/llama-3.2-3b-instruct:free"  # Alternative: "google/gemma-2-9b-it:free" or "mistralai/mistral-7b-instruct:free"

def generate_completion(prompt, temperature=0.7, max_tokens=2000):
    """Helper function to generate completion from OpenRouter"""
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "SavoraAI"
        }
        
        data = {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        print(f"\n=== OpenRouter Request ===")
        print(f"URL: {OPENROUTER_API_URL}")
        print(f"Model: {MODEL}")
        print(f"API Key (first 20 chars): {api_key[:20]}...")
        print(f"Headers: {headers}")
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
        
        print(f"\n=== OpenRouter Response ===")
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text[:1000]}")
        
        if response.status_code != 200:
            error_detail = response.text
            raise Exception(f"{response.status_code} Client Error: {error_detail} for url: {OPENROUTER_API_URL}")
        
        result = response.json()
        return result['choices'][0]['message']['content']
    except requests.exceptions.RequestException as e:
        print(f"Request error details: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        raise Exception(f"OpenRouter API error: {str(e)}")

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Welcome to SAVORA AI Backend API',
        'status': 'running',
        'model': MODEL,
        'endpoints': {
            '/generate': 'POST - Generate recipe from ingredients',
            '/chat': 'POST - Chat with recipe assistant',
            '/rescue': 'POST - Get help fixing cooking problems',
            '/nutrition': 'POST - Get nutrition information',
            '/meal-plan': 'POST - Generate weekly meal plan',
            '/health': 'GET - Health check'
        }
    })

@app.route('/generate', methods=['POST'])
def generate_recipe():
    """
    Generate recipe based on user inputs
    Expected JSON: {ingredients, cuisine, taste, mealType, portion, dietary, spiceLevel, cookingTime}
    """
    try:
        data = request.json
        ingredients = data.get('ingredients', [])
        cuisine = data.get('cuisine', 'Any')
        taste = data.get('taste', 'Any')
        meal_type = data.get('mealType', 'Any')
        portion = data.get('portion', '2-3 people')
        dietary = data.get('dietary', 'None')
        spice_level = data.get('spiceLevel', 'Medium')
        cooking_time = data.get('cookingTime', 'Any')
        
        # Build comprehensive prompt
        prompt = f"""
You are a professional chef AI assistant. Create a detailed recipe based on these requirements:

INGREDIENTS AVAILABLE: {', '.join(ingredients) if isinstance(ingredients, list) else ingredients}
CUISINE TYPE: {cuisine}
TASTE PREFERENCE: {taste}
MEAL TYPE: {meal_type}
PORTION SIZE: {portion}
DIETARY RESTRICTIONS: {dietary}
SPICE LEVEL: {spice_level}
COOKING TIME: {cooking_time}

Please provide a recipe in this EXACT JSON format (respond with ONLY valid JSON, no markdown):
{{
    "title": "Creative dish name",
    "description": "Brief enticing description of the dish",
    "prepTime": "15 mins",
    "cookTime": "30 mins",
    "totalTime": "45 mins",
    "difficulty": "Easy/Medium/Hard",
    "servings": "{portion}",
    "cuisine": "{cuisine}",
    "ingredients": [
        "Ingredient 1 with measurement",
        "Ingredient 2 with measurement"
    ],
    "instructions": [
        "Step 1 instruction",
        "Step 2 instruction"
    ],
    "tips": [
        "Helpful tip 1",
        "Helpful tip 2"
    ],
    "nutrition": {{
        "calories": "approximate per serving",
        "protein": "approximate",
        "carbs": "approximate",
        "fat": "approximate"
    }},
    "alternatives": [
        "Alternative ingredient suggestion 1",
        "Alternative ingredient suggestion 2"
    ]
}}

Make the recipe creative, practical, and delicious! Ensure it matches the {spice_level} spice level and can be prepared within {cooking_time}. Return ONLY the JSON object, no additional text.
"""
        
        # Generate response from OpenRouter
        recipe_text = generate_completion(prompt, temperature=0.7, max_tokens=2000)
        recipe_text = recipe_text.strip()
        
        # Try to parse as JSON
        try:
            # Remove markdown code blocks if present
            if recipe_text.startswith('```'):
                recipe_text = recipe_text.split('```')[1]
                if recipe_text.startswith('json'):
                    recipe_text = recipe_text[4:]
                recipe_text = recipe_text.strip()
            recipe_json = json.loads(recipe_text)
            
            return jsonify({
                'success': True,
                'recipe': recipe_json,
                'format': 'json'
            })
        except json.JSONDecodeError:
            # Return as text if JSON parsing fails
            return jsonify({
                'success': True,
                'recipe': recipe_text,
                'format': 'text'
            })
    
    except Exception as e:
        print(f"Error in generate_recipe: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/chat', methods=['POST'])
def chat():
    """
    Handle chatbot follow-up questions about cooking
    Expected JSON: {question, recipeContext}
    """
    try:
        data = request.json
        question = data.get('question', '')
        recipe_context = data.get('recipeContext', '')
        
        # Build chatbot prompt with recipe context
        prompt = f"""
You are a friendly and helpful cooking assistant named Chef Savora. The user is cooking this recipe:

{json.dumps(recipe_context) if isinstance(recipe_context, dict) else recipe_context}

User's question: {question}

Provide a clear, helpful, and friendly answer to their cooking question. Be concise and practical.
Use emojis occasionally to be more engaging. If you don't know something, be honest about it.
"""
        
        answer = generate_completion(prompt, temperature=0.7, max_tokens=500)
        
        return jsonify({
            'success': True,
            'answer': answer
        })
    
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/rescue', methods=['POST'])
def rescue_recipe():
    """
    Rescue My Recipe mode - help fix cooking disasters
    Expected JSON: {problem, dishType}
    """
    try:
        data = request.json
        problem = data.get('problem', '')
        dish_type = data.get('dishType', '')
        
        prompt = f"""
You are an expert chef helping someone fix a cooking problem. Be calm, reassuring, and practical.

DISH TYPE: {dish_type}
PROBLEM: {problem}

Provide immediate, practical solutions to rescue this dish. Be specific and actionable.
Format your response as:

🚨 QUICK FIXES (what to do RIGHT NOW):
[Immediate actions]

🔧 ADJUSTMENTS NEEDED:
[Specific adjustments]

💡 PRO TIP:
[How to prevent this next time]

Be encouraging - most cooking mistakes can be fixed!
"""
        
        solution = generate_completion(prompt, temperature=0.7, max_tokens=800)
        
        return jsonify({
            'success': True,
            'solution': solution
        })
    
    except Exception as e:
        print(f"Error in rescue_recipe: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/nutrition', methods=['POST'])
def get_nutrition():
    """
    Get nutrition information for a recipe or ingredient
    Expected JSON: {recipe or ingredients}
    """
    try:
        data = request.json
        recipe = data.get('recipe', '')
        ingredients = data.get('ingredients', '')
        
        content = recipe if recipe else ingredients
        
        prompt = f"""
Analyze the nutritional content of this recipe/ingredients:

{json.dumps(content) if isinstance(content, dict) else content}

Provide a detailed nutritional breakdown in this JSON format:
{{
    "perServing": {{
        "calories": "number",
        "protein": "Xg",
        "carbs": "Xg",
        "fat": "Xg",
        "fiber": "Xg",
        "sugar": "Xg",
        "sodium": "Xmg"
    }},
    "healthScore": "1-10 rating",
    "benefits": ["health benefit 1", "health benefit 2"],
    "considerations": ["dietary consideration 1"],
    "tips": "tip to make it healthier"
}}

Return ONLY valid JSON.
"""
        
        result = generate_completion(prompt, temperature=0.5, max_tokens=800)
        result = result.strip()
        
        try:
            if result.startswith('```'):
                result = result.split('```')[1]
                if result.startswith('json'):
                    result = result[4:]
                result = result.strip()
            nutrition_json = json.loads(result)
            return jsonify({
                'success': True,
                'nutrition': nutrition_json
            })
        except json.JSONDecodeError:
            return jsonify({
                'success': True,
                'nutrition': result
            })
    
    except Exception as e:
        print(f"Error in get_nutrition: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/meal-plan', methods=['POST'])
def generate_meal_plan():
    """
    Generate a weekly meal plan
    Expected JSON: {preferences, dietary, peopleCount}
    """
    try:
        data = request.json
        preferences = data.get('preferences', 'balanced')
        dietary = data.get('dietary', 'none')
        people_count = data.get('peopleCount', 2)
        
        prompt = f"""
Create a 7-day meal plan with the following requirements:

PREFERENCES: {preferences}
DIETARY RESTRICTIONS: {dietary}
SERVINGS: {people_count} people

Provide a meal plan in this JSON format:
{{
    "weekPlan": [
        {{
            "day": "Monday",
            "breakfast": {{"name": "dish name", "quickDescription": "brief description"}},
            "lunch": {{"name": "dish name", "quickDescription": "brief description"}},
            "dinner": {{"name": "dish name", "quickDescription": "brief description"}},
            "snack": {{"name": "snack name", "quickDescription": "brief description"}}
        }}
    ],
    "shoppingList": ["ingredient 1", "ingredient 2"],
    "tips": ["meal prep tip 1", "meal prep tip 2"]
}}

Make it varied, nutritious, and practical. Return ONLY valid JSON.
"""
        
        result = generate_completion(prompt, temperature=0.7, max_tokens=3000)
        result = result.strip()
        
        try:
            if result.startswith('```'):
                result = result.split('```')[1]
                if result.startswith('json'):
                    result = result[4:]
                result = result.strip()
            meal_plan_json = json.loads(result)
            return jsonify({
                'success': True,
                'mealPlan': meal_plan_json
            })
        except json.JSONDecodeError:
            return jsonify({
                'success': True,
                'mealPlan': result
            })
    
    except Exception as e:
        print(f"Error in generate_meal_plan: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/suggest-ingredients', methods=['POST'])
def suggest_ingredients():
    """
    Suggest complementary ingredients based on what user has
    """
    try:
        data = request.json
        current_ingredients = data.get('ingredients', [])
        
        prompt = f"""
The user has these ingredients: {', '.join(current_ingredients) if isinstance(current_ingredients, list) else current_ingredients}

Suggest 5-8 complementary ingredients that would pair well to make delicious dishes.
Return as a JSON array of objects:
[
    {{"ingredient": "name", "reason": "why it pairs well", "dishes": ["possible dish 1", "possible dish 2"]}}
]

Return ONLY valid JSON.
"""
        
        result = generate_completion(prompt, temperature=0.7, max_tokens=1000)
        result = result.strip()
        
        try:
            if result.startswith('```'):
                result = result.split('```')[1]
                if result.startswith('json'):
                    result = result[4:]
                result = result.strip()
            suggestions = json.loads(result)
            return jsonify({
                'success': True,
                'suggestions': suggestions
            })
        except json.JSONDecodeError:
            return jsonify({
                'success': True,
                'suggestions': result
            })
    
    except Exception as e:
        print(f"Error in suggest_ingredients: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'api_configured': api_key is not None,
        'model': MODEL
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
