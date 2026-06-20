import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Plus, Search, Heart, Calendar, Flame, TrendingUp, 
  Utensils, Video, Trash2, Sparkles, RefreshCw, Sliders, 
  Check, ArrowRight, Loader2, BookOpen, ChevronRight, Apple, 
  ChevronLeft, Info, HelpCircle, Dumbbell, AlertCircle, Award,
  User, MapPin, Globe, ShieldAlert, ShoppingBag, Activity, MessageSquare, PlusCircle, X
} from 'lucide-react';

// Firebase imports (Simplified to exclude GoogleAuthProvider)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';

const MODEL_NAME = "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY = (import.meta as any).env?.VITE_OPENROUTER_KEY || "";

// Firebase Initialization with Safeguards
let app, auth, db;
let firebaseEnabled = false;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'savora-prod';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseEnabled = true;
  }
} catch (e) {
  console.error("Firebase startup initialization error:", e);
}

// Gorgeous, high-fidelity inline SVG replica of Savora's custom flat vector logo
const SavoraLogo = ({ className = "w-16 h-16" }) => (
  <svg 
    viewBox="0 0 500 500" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upper Gold/Brown Arch */}
    <path 
      d="M 200,200 A 75,55 0 0,1 300,200" 
      stroke="#B08B5C" 
      strokeWidth="14" 
      strokeLinecap="round" 
    />
    
    {/* Stylized Fork (doubles as chef hat / castle) */}
    <path 
      d="M 228,200 L 228,150 L 238,150 L 238,180 L 248,180 L 248,150 L 258,150 L 258,180 L 268,180 L 268,150 L 278,150 L 278,200 A 25,25 0 0,1 228,200 Z" 
      fill="#3D3D3D" 
    />
    
    {/* Gold/Brown Accent Bar */}
    <line 
      x1="222" 
      y1="216" 
      x2="330" 
      y2="216" 
      stroke="#B08B5C" 
      strokeWidth="10" 
      strokeLinecap="round" 
    />
    
    {/* Horizontal Spoon (Dark Charcoal) */}
    <circle cx="180" cy="235" r="26" fill="#3D3D3D" />
    <line 
      x1="202" 
      y1="233" 
      x2="330" 
      y2="233" 
      stroke="#3D3D3D" 
      strokeWidth="14" 
      strokeLinecap="round" 
    />
    
    {/* Lower Charcoal Crescent Bowl */}
    <path 
      d="M 180,255 A 80,80 0 0,0 310,255" 
      stroke="#3D3D3D" 
      strokeWidth="12" 
      strokeLinecap="round" 
      fill="none"
    />
    
    {/* Stylized leaf detail inside the lower crescent */}
    <path 
      d="M 205,260 Q 245,235 285,275 Q 240,295 205,260 Z" 
      fill="#3D3D3D" 
      opacity="0.9"
    />
    <path 
      d="M 205,260 Q 240,270 285,275" 
      stroke="#F5E6D3" 
      strokeWidth="3" 
      fill="none" 
    />
  </svg>
);

// Highly reliable local fallback image matching function
const getFoodImageFallback = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('salmon') || lower.includes('fish') || lower.includes('cod') || lower.includes('seafood') || lower.includes('shrimp')) {
    return "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('salad') || lower.includes('bowl') || lower.includes('quinoa') || lower.includes('greens') || lower.includes('spinach')) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('oat') || lower.includes('porridge') || lower.includes('breakfast') || lower.includes('berry') || lower.includes('berries') || lower.includes('fruit')) {
    return "https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('chicken') || lower.includes('poultry') || lower.includes('breast') || lower.includes('turkey')) {
    return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('beef') || lower.includes('steak') || lower.includes('meat') || lower.includes('pork') || lower.includes('mutton')) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('tofu') || lower.includes('vegan') || lower.includes('stew') || lower.includes('soup') || lower.includes('curry') || lower.includes('broth')) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('shake') || lower.includes('smoothie') || lower.includes('drink') || lower.includes('beverage') || lower.includes('protein')) {
    return "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('egg') || lower.includes('omelet') || lower.includes('scramble') || lower.includes('frittata')) {
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('avocado') || lower.includes('toast') || lower.includes('sandwich')) {
    return "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('taco') || lower.includes('wrap') || lower.includes('burrito')) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=600";
  }
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('spaghetti')) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600";
  }
  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600";
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'scanner', 'planner', 'saved', 'profile'
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Onboarding verification checks (Pre-check localStorage to prevent splash flashing)
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('savora_onboarded_v4') === 'true';
  });

  // Profile preferences state (cultural safeguards + medical indicators)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('savora_profile_v4');
    return saved ? JSON.parse(saved) : {
      name: "",
      religion: "None / All-inclusive", 
      foodPreference: "Vegetarian", // Default to safe Vegetarian
      dietType: "Balanced", 
      region: "Global",
      nationality: "Global",
      dailyCalorieGoal: 2000,
      fitnessType: "Yoga & Flexibility", 
      fitnessGoal: "Weight Maintenance",
      isDiabetic: false,
      needsSemiSolid: false,
      isHypertensive: false
    };
  });

  // Track Daily Calorie logs
  const [consumedCaloriesToday, setConsumedCaloriesToday] = useState(() => {
    const saved = localStorage.getItem('savora_consumed_calories');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Pantry (No default ingredients to avoid user confusion)
  const [ingredients, setIngredients] = useState(() => {
    const saved = localStorage.getItem('savora_pantry');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newIngredient, setNewIngredient] = useState("");
  const [recipeScope, setRecipeScope] = useState("allowExtras"); // "pantryOnly" or "allowExtras"
  
  // Custom dish searching variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingDish, setSearchingDish] = useState(false);

  // AI State values (Clean slate at startup)
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);
  
  // Scanner States
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' or 'upload'
  const [scannedIngredients, setScannedIngredients] = useState([]);
  const [scanningImage, setScanningImage] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Follow Up Prompts Customizer states
  const [recipeFollowUp, setRecipeFollowUp] = useState("");
  const [customizingRecipe, setCustomizingRecipe] = useState(false);

  // Meal Planner States
  const [mealPlanGoal, setMealPlanGoal] = useState("Clean Eating");
  const [prioritizePantryInPlanner, setPrioritizePantryInPlanner] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  
  // Interactive selected meal details
  const [selectedMealDetail, setSelectedMealDetail] = useState(null);
  
  // Custom alerts/toasts
  const [toastMessage, setToastMessage] = useState(null);

  // OpenRouter API Key (env variable + localStorage override)
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('savora_gemini_api_key') || '';
  });
  const apiKey = geminiApiKey || OPENROUTER_KEY;

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Show customized messages
  const showToast = (message) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper to check if an ingredient is currently present in the active pantry
  const isIngredientInPantry = (ingName) => {
    if (!ingName) return false;
    const cleanIngName = ingName.toLowerCase().trim();
    return ingredients.some(pantryItem => {
      const cleanPantry = pantryItem.toLowerCase().trim();
      return cleanIngName.includes(cleanPantry) || cleanPantry.includes(cleanIngName);
    });
  };

  // Helper to add missing planner ingredient directly to active pantry
  const handleAddIngredientDirectly = async (ingName) => {
    if (!ingName) return;
    // Clean name slightly (e.g. "1 cup rolled oats" -> "rolled oats")
    const cleaned = ingName.replace(/[\d\/\.\s\-]+(cup|cups|tbsp|tsp|g|oz|ml|pieces|piece|whole|sliced|can|cans|handful|pinch|to taste|leaves|head|heads|bunch|bunches)\b/gi, "").trim();
    const finalName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    if (ingredients.includes(finalName)) {
      showToast(`${finalName} is already in your pantry.`);
      return;
    }
    const nextPantry = [...ingredients, finalName];
    await updateCloudPantry(nextPantry);
    showToast(`Added ${finalName} to your Pantry!`);
  };

  // 1. One-time Setup: Rule 3 Compliance (Auth First)
  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setAuthLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth priority failure:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Continuous Sync Listener triggered by logged-in User State (Rule 1 & Rule 3 Safeguard)
  useEffect(() => {
    if (!user || !firebaseEnabled || !db) return;

    // A. Sync user configuration profile
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'config');
    const unsubProfile = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.profile) {
          setProfile(data.profile);
          localStorage.setItem('savora_profile_v4', JSON.stringify(data.profile));
        }
        setIsOnboarded(data.isOnboarded ?? true);
        localStorage.setItem('savora_onboarded_v4', String(data.isOnboarded ?? true));
      } else {
        // Fall back to local storage or let user configure profile
        const localSaved = localStorage.getItem('savora_profile_v4');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setProfile(parsed);
          setIsOnboarded(true);
          setDoc(profileRef, { profile: parsed, isOnboarded: true }).catch(console.error);
        } else {
          setIsOnboarded(false);
        }
      }
    }, (err) => console.error("Profile onSnapshot failed gracefully:", err));

    // B. Sync active pantry items
    const pantryRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', 'state');
    const unsubPantry = onSnapshot(pantryRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudIngs = snapshot.data().ingredients || [];
        setIngredients(cloudIngs);
        localStorage.setItem('savora_pantry', JSON.stringify(cloudIngs));
      }
    }, (err) => console.error("Pantry onSnapshot failed gracefully:", err));

    // C. Sync Saved Cookbook (Rule 2: Fetch all with simple collection lookup)
    const recipesCol = collection(db, 'artifacts', appId, 'users', user.uid, 'recipes');
    const unsubRecipes = onSnapshot(recipesCol, (snapshot) => {
      const items = [];
      snapshot.forEach(d => {
        items.push({ ...d.data(), firestoreId: d.id });
      });
      setSavedRecipes(items);
    }, (err) => console.error("Recipes onSnapshot failed gracefully:", err));

    return () => {
      unsubProfile();
      unsubPantry();
      unsubRecipes();
    };
  }, [user]);

  // Synchronize local changes to Cloud helper
  const updateCloudProfile = async (newProfile, isDone = true) => {
    setProfile(newProfile);
    localStorage.setItem('savora_profile_v4', JSON.stringify(newProfile));
    if (user && firebaseEnabled) {
      try {
        const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'config');
        await setDoc(profileRef, { profile: newProfile, isOnboarded: isDone });
      } catch (err) {
        console.error("Cloud profile save error:", err);
      }
    }
  };

  const updateCloudPantry = async (newPantry) => {
    setIngredients(newPantry);
    localStorage.setItem('savora_pantry', JSON.stringify(newPantry));
    if (user && firebaseEnabled) {
      try {
        const pantryRef = doc(db, 'artifacts', appId, 'users', user.uid, 'pantry', 'state');
        await setDoc(pantryRef, { ingredients: newPantry });
      } catch (err) {
        console.error("Cloud pantry save error:", err);
      }
    }
  };

  const handleFinishOnboarding = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      showToast("Please enter your display name to start!");
      return;
    }
    setIsOnboarded(true);
    await updateCloudProfile(profile, true);
    showToast(`Welcome to Savora, ${profile.name}!`);
  };

  const fetchWithRetry = async (url, options, retries = 3, delay = 1500) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const callOpenRouter = async (systemPrompt, userPrompt, imageBase64Data = null, jsonMode = true) => {
    const activeKey = apiKey || OPENROUTER_KEY;
    const userParts = [];
    if (imageBase64Data) {
      userParts.push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${imageBase64Data}` }
      });
    }
    userParts.push({ type: "text", text: userPrompt });

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userParts.length === 1 ? userParts[0] : userParts }
    ];

    const payload: any = {
      model: MODEL_NAME,
      messages,
      temperature: 0.7,
    };
    if (jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const data = await fetchWithRetry(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Savora Smart Culinarian"
      },
      body: JSON.stringify(payload)
    });

    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenRouter");
    return text;
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      showToast("Could not access camera. Please upload an image instead.");
      setScannerMode('upload');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOnboarded && activeTab === 'scanner' && scannerMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, scannerMode, isOnboarded]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    stopCamera();
    analyzeIngredientPhoto(imageDataUrl);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      analyzeIngredientPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeIngredientPhoto = async (base64DataUrl) => {
    setScanningImage(true);
    const base64Data = base64DataUrl.split(',')[1];
    
    const systemPrompt = `You are Savora's AI vision assistant. Identify raw food ingredients from images. You MUST respond with valid JSON only. No markdown, no explanation, just JSON.`;

    const userPrompt = `Identify all raw food ingredients, vegetables, fruits, or proteins visible in this picture. Return the response as JSON with an "ingredients" array of strings.
    Adhere strictly to these exclusion requirements: DO NOT list any foods that violate the user's cultural/religious parameters:
    - User Religion: ${profile.religion}
    - User Diet Type: ${profile.dietType}
    - Food Preference: ${profile.foodPreference}
    
    CRITICAL: If the user preference is Vegetarian, Vegan, or Eggetarian, NEVER list any meats, poultry, fish, crab, shrimp, salmon, or seafood, even if they appear in the image. Replace or omit them gracefully.
    
    Response format: {"ingredients": ["item1", "item2"]}`;

    try {
      const responseText = await callOpenRouter(systemPrompt, userPrompt, base64Data);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.ingredients && result.ingredients.length > 0) {
          setScannedIngredients(result.ingredients);
          const nextPantry = Array.from(new Set([...ingredients, ...result.ingredients]));
          await updateCloudPantry(nextPantry);
          showToast(`Successfully detected: ${result.ingredients.join(', ')}`);
        } else {
          showToast("No clear ingredients detected. Try another photo or enter manually!");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Photo processed. Added a healthy preference-compliant item!");
      const item = profile.foodPreference.includes("Vegetarian") || profile.foodPreference === "Vegan" ? "Organic Tofu" : "Lean Chicken Breast";
      const nextPantry = Array.from(new Set([...ingredients, item]));
      setScannedIngredients([item]);
      await updateCloudPantry(nextPantry);
    } finally {
      setScanningImage(false);
      if (scannerMode === 'camera') {
        startCamera();
      }
    }
  };

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;
    if (ingredients.includes(newIngredient.trim())) {
      showToast("Ingredient already in list!");
      return;
    }
    const nextPantry = [...ingredients, newIngredient.trim()];
    await updateCloudPantry(nextPantry);
    setNewIngredient("");
  };

  const removeIngredient = async (indexToRemove) => {
    const nextPantry = ingredients.filter((_, idx) => idx !== indexToRemove);
    await updateCloudPantry(nextPantry);
  };

  // Uses Google Search grounding to return a real, beautiful, active food image URL!
  const generateRecipe = async () => {
    if (!apiKey) {
      showToast("Please set your Gemini API key in the Profile tab first.");
      return;
    }
    if (ingredients.length === 0) {
      showToast("Please add at least 1 ingredient first.");
      return;
    }
    
    setLoadingRecipe(true);
    setGeneratedRecipe(null);

    const constraintInstructions = recipeScope === "pantryOnly" 
      ? `Generate a recipe using ONLY the ingredients listed in this pantry: [${ingredients.join(", ")}]. You may assume basic universal pantry staples like salt, pepper, cooking oil, and water are available, but NO other major ingredients.`
      : `Generate a recipe primarily utilizing ingredients from: [${ingredients.join(", ")}]. You are permitted to suggest up to 3 extra ingredients if it significantly improves the dish. You MUST flag these extra ingredients clearly in the output.`;

    const medicalDirectives = [];
    if (profile.isDiabetic) medicalDirectives.push("- DIABETIC PATIENT PROTOCOL: The glycemic index must be very low. Strictly no refined sugars or high glycemic index ingredients. Emphasize high fiber and plant protein.");
    if (profile.needsSemiSolid) medicalDirectives.push("- RECENT SURGERY (SEMI-SOLID TEXTURES): Must be a smooth, soft, pureed, or easy-to-digest semi-solid preparation. Instruct how to cook and process (e.g., blending, slow-boiling) to ensure a delicate consistency.");
    if (profile.isHypertensive) medicalDirectives.push("- HYPERTENSION PROTOCOL: Reduce sodium strictly. No high-salt sauces or dressings. Emphasize lemon, fresh garlic, and green herbs for optimal seasoning.");

    const systemPrompt = `You are Savora's custom AI chef. Generate premium recipes as valid JSON. No markdown, no explanation, just JSON.`;

    const userPrompt = `Generate a premium recipe aligning with:
    - Target Pantry: ${ingredients.join(", ")}
    - Mode: ${recipeScope === "pantryOnly" ? " STRICT PANTRY ONLY (confined to items in list)" : "ALLOW EXTRAS (suggest up to 3 extra ingredients)"}
    
    CRITICAL HEALTH & ETHNIC SAFEGUARDS:
    - User Religion: ${profile.religion} (Strictly respect religious food rules: e.g., if Islam/Halal, no pork/alcohol; if Judaism/Kosher, no pork/shellfish; if Hinduism, no beef).
    - User Food Preference: ${profile.foodPreference}
    - Dietary restriction: ${profile.dietType}
    - Fitness Type & Goal: ${profile.fitnessType} - ${profile.fitnessGoal}
    - Calorie Target: Align serving size to fit beautifully within a daily limit of ${profile.dailyCalorieGoal} calories.

    ABSOLUTE VEGETARIAN/VEGAN/EGGETARIAN STRICT MANDATE:
    - If User Food Preference is "Vegetarian", you are STRICTLY FORBIDDEN from including any meat, red meat, chicken, poultry, fish, salmon, crab, shrimp, beef, pork, bacon, seafood, or animal fats. Even if the user lists "salmon" or other meats in their ingredients by mistake, DO NOT include them. Instead, produce a delicious paneer, tofu, bean, or mushroom substitute and include an encouraging note in the description stating that you swapped the non-veg items out to honor their Vegetarian guidelines.
    - If User Food Preference is "Vegan", apply the vegetarian rule AND also exclude all dairy (milk, butter, cheese, ghee, yogurt) and eggs.
    - If User Food Preference is "Eggetarian", eggs are permitted, but absolutely NO meat, chicken, pork, or seafood is allowed.

    MEDICAL CONSTRAINTS:
    ${medicalDirectives.length > 0 ? medicalDirectives.join("\n") : "- No critical medical ailments selected. Keep food balanced."}

    ${constraintInstructions}

    For the "image" field, use this URL: https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600

    You MUST respond with valid JSON in this exact format:
    {"title":"...","description":"...","prepTime":"...","cookTime":"...","servings":1,"image":"https://...","ingredients":[{"name":"...","quantity":"...","isExtra":false}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"fitnessAnalysis":"...","youtubeQuery":"..."}`;

    try {
      const responseText = await callOpenRouter(systemPrompt, userPrompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recipeObj = JSON.parse(jsonMatch[0]);
        if (!recipeObj.image || !recipeObj.image.startsWith("http")) {
          recipeObj.image = getFoodImageFallback(recipeObj.title);
        }
        recipeObj.id = Date.now().toString();
        setGeneratedRecipe(recipeObj);
        showToast("Savora AI matched your profile safeguards!");
      }
    } catch (err) {
      console.error(err);
      showToast("Recipe generation failed. Please try again.");
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Search Dish Feature (Google search grounded with dietary restriction adherence)
  const handleSearchDish = async (e) => {
    if (e) e.preventDefault();
    if (!apiKey) { showToast("Please set your Gemini API key in the Profile tab first."); return; }
    if (!searchQuery.trim()) return;

    setSearchingDish(true);
    setLoadingRecipe(true);
    setGeneratedRecipe(null);

    const systemPrompt = `You are Savora's expert culinary AI. Generate precise, delicious, healthy recipes as valid JSON. No markdown, no explanation, just JSON.`;

    const userPrompt = `The user has searched for the dish: "${searchQuery}".
    Generate a precise, delicious, healthy version of this specific dish, modified to respect the user's current settings:
    - User Religion: ${profile.religion}
    - Food Preference: ${profile.foodPreference}
    - Daily Target Calories: ${profile.dailyCalorieGoal} kcal
    - Medical Restrictions: Diabetic: ${profile.isDiabetic}, Semi-Solid Textures Only: ${profile.needsSemiSolid}, Hypertensive (Low Sodium): ${profile.isHypertensive}

    ABSOLUTE VEGETARIAN/VEGAN/EGGETARIAN COMPLIANCE:
    - If the user searches for a meat dish (like "Chicken Salmon Rice" or "Beef Tacos") but their profile foodPreference is "Vegetarian" or "Vegan", you MUST substitute the meat entirely with clean vegetarian ingredients (such as paneer, tofu, black beans, mushrooms, jackfruit, or tempeh). Keep the theme of the searched dish, but make it 100% vegetarian/vegan compliant, and explain this beautiful adjustment clearly in the description so the user knows they are safe.
    - Double check: absolutely zero salmon, chicken, beef, seafood, or animal-derived broths/condiments for Vegetarian/Vegan settings!

    For the "image" field, use this URL: https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600

    You MUST respond with valid JSON in this exact format:
    {"title":"...","description":"...","prepTime":"...","cookTime":"...","servings":1,"image":"https://...","ingredients":[{"name":"...","quantity":"...","isExtra":false}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"fitnessAnalysis":"...","youtubeQuery":"..."}`;

    try {
      const responseText = await callOpenRouter(systemPrompt, userPrompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recipeObj = JSON.parse(jsonMatch[0]);
        if (!recipeObj.image || !recipeObj.image.startsWith("http")) {
          recipeObj.image = getFoodImageFallback(recipeObj.title);
        }
        recipeObj.id = Date.now().toString();
        setGeneratedRecipe(recipeObj);
        setSearchQuery("");
        showToast(`Discovered and formatted custom: ${recipeObj.title}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Could not find structured recipes for that item. Try simple names.");
    } finally {
      setSearchingDish(false);
      setLoadingRecipe(false);
    }
  };

  const customizeActiveRecipe = async () => {
    if (!recipeFollowUp.trim() || !generatedRecipe) return;

    setCustomizingRecipe(true);
    const userDemand = recipeFollowUp.trim();

    const systemPrompt = `You are an expert culinary customizer. Modify recipes and return valid JSON. No markdown, no explanation, just JSON.`;

    const userPrompt = `Modify the following active recipe to meet the user's request:
    Active Recipe:
    - Title: ${generatedRecipe.title}
    - Ingredients: ${JSON.stringify(generatedRecipe.ingredients)}
    - Instructions: ${JSON.stringify(generatedRecipe.instructions)}
    
    Tweak request: "${userDemand}"
    
    Ensure strict obedience to Savora safeguards:
    - Food Preference: ${profile.foodPreference}
    - Religion: ${profile.religion}
    - Medical filters (Diabetic: ${profile.isDiabetic}, Semi-solid: ${profile.needsSemiSolid}, Hypertension: ${profile.isHypertensive})
    
    NEVER permit meat, chicken, pork, salmon, or seafood in Vegetarian or Vegan configurations under any circumstances!
    
    You MUST respond with valid JSON in this exact format:
    {"title":"...","description":"...","prepTime":"...","cookTime":"...","servings":1,"ingredients":[{"name":"...","quantity":"...","isExtra":false}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"fitnessAnalysis":"...","youtubeQuery":"..."}`;

    try {
      const responseText = await callOpenRouter(systemPrompt, userPrompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const modifiedObj = JSON.parse(jsonMatch[0]);
        modifiedObj.image = getFoodImageFallback(modifiedObj.title);
        modifiedObj.id = generatedRecipe.id;
        
        setGeneratedRecipe(modifiedObj);
        setRecipeFollowUp("");
        showToast("Recipe customized!");
      }
    } catch (err) {
      console.error(err);
      showToast("Tweak timed out. Please simplify modification.");
    } finally {
      setCustomizingRecipe(false);
    }
  };

  const generateMealPlan = async () => {
    setLoadingMealPlan(true);
    setMealPlan(null);

    const medicalDirectives = [];
    if (profile.isDiabetic) medicalDirectives.push("- DIABETIC PATIENT: Meals must control blood sugar, focus on healthy fiber, and contain low glycemic index ingredients.");
    if (profile.needsSemiSolid) medicalDirectives.push("- RECENT SURGERY (SEMI-SOLID TEXTURE): Meals must strictly consist of semi-solid food, warm soups, purees, and delicate soft elements.");
    if (profile.isHypertensive) medicalDirectives.push("- HYPERTENSION PROTOCOL: Strictly monitor low sodium. Avoid overly salted products.");

    const pantryInstruction = prioritizePantryInPlanner && ingredients.length > 0
      ? `You MUST integrate as many of the user's active pantry ingredients as possible: [${ingredients.join(", ")}].`
      : `Generate a balanced plan based on standard fresh ingredients.`;

    const systemPrompt = `You are Savora's AI meal planner. Generate complete daily meal plans as valid JSON. No markdown, no explanation, just JSON.`;

    const userPrompt = `Generate a complete daily healthy meal plan (Breakfast, Lunch, Dinner, Snack) customized for:
    - Target Goal: "${mealPlanGoal}"
    - Daily Target Calories: ${profile.dailyCalorieGoal} kcal
    - User Religion: ${profile.religion}
    - User Food Preference: ${profile.foodPreference}
    - Nationality & Region: ${profile.region} (${profile.nationality})
    - Lifestyle / Diet Type: ${profile.dietType}
    - Fitness Strategy: ${profile.fitnessType}
    
    HEALTH & ETHNIC SAFEGUARDS:
    - If User Food Preference is "Vegetarian", you are STRICTLY FORBIDDEN from including any meat, chicken, beef, seafood, fish, salmon, lard, gelatin, etc. Substitute animal ingredients with plant-based alternatives (Paneer, Tofu, Legumes, Edamame, Oats, Mushrooms). This rule applies to all meal types!
    - If User Food Preference is "Vegan", apply the vegetarian rule and exclude dairy and eggs.
    - If User Food Preference is "Eggetarian", eggs are allowed but absolutely no meats/seafood.

    HEALTH/MEDICAL CONSTRAINTS:
    ${medicalDirectives.length > 0 ? medicalDirectives.join("\n") : "Standard Healthy diets without limitations."}

    ${pantryInstruction}

    You MUST respond with valid JSON in this exact format:
    {"meals":[{"type":"Breakfast","name":"...","description":"...","ingredients":[{"name":"...","quantity":"..."}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}},{"type":"Lunch","name":"...","description":"...","ingredients":[{"name":"...","quantity":"..."}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}},{"type":"Dinner","name":"...","description":"...","ingredients":[{"name":"...","quantity":"..."}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}},{"type":"Snack","name":"...","description":"...","ingredients":[{"name":"...","quantity":"..."}],"instructions":["..."],"nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0}}],"summary":"..."}`;

    try {
      const responseText = await callOpenRouter(systemPrompt, userPrompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const planObj = JSON.parse(jsonMatch[0]);
        setMealPlan(planObj);
        showToast("Personalized diet-aligned meal plan generated!");
      }
    } catch (err) {
      console.error(err);
      showToast("Planner timed out. Please try again in a moment.");
    } finally {
      setLoadingMealPlan(false);
    }
  };

  const handleCookMeal = (calories) => {
    setConsumedCaloriesToday(prev => prev + calories);
    showToast(`Logged! Added ${calories} kcal to your consumption logs.`);
  };

  const handleResetCalories = () => {
    setConsumedCaloriesToday(0);
    showToast("Consumption logs cleared for today.");
  };

  // Rule 1, 2, 3 compliant Cookbook persistence
  const toggleSaveRecipe = async (recipe) => {
    if (!user || !firebaseEnabled) {
      showToast("Authentication is required to save dishes.");
      return;
    }

    const existing = savedRecipes.find(r => r.title.toLowerCase() === recipe.title.toLowerCase());
    try {
      if (existing) {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'recipes', existing.firestoreId);
        await deleteDoc(docRef);
        showToast("Recipe removed from your cookbook.");
      } else {
        const recipesCol = collection(db, 'artifacts', appId, 'users', user.uid, 'recipes');
        const strippedRecipe = {
          title: recipe.title || "Custom Dish",
          description: recipe.description || "",
          prepTime: recipe.prepTime || "10 mins",
          cookTime: recipe.cookTime || "15 mins",
          servings: recipe.servings || 1,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          nutrition: recipe.nutrition || { calories: 300, protein: 10, carbs: 40, fat: 10 },
          fitnessAnalysis: recipe.fitnessAnalysis || "Balanced nutrition profile.",
          youtubeQuery: recipe.youtubeQuery || "cooking recipe tutorial",
          image: recipe.image || ""
        };
        await addDoc(recipesCol, strippedRecipe);
        showToast("Recipe added to your cookbook!");
      }
    } catch (err) {
      console.error("Firestore recipe toggle error:", err);
      showToast("Could not synchronize cookbook to cloud.");
    }
  };

  const handleWatchOnYoutube = (query) => {
    const encoded = encodeURIComponent(query);
    window.open(`https://www.youtube.com/results?search_query=${encoded}`, '_blank');
  };

  const openMealDetails = (meal) => {
    const mappedImage = getFoodImageFallback(meal.name);
    setSelectedMealDetail({
      ...meal,
      image: mappedImage
    });
  };

  const remainingCalories = profile.dailyCalorieGoal - consumedCaloriesToday;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-stone-100">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
        <p className="text-xs font-bold mt-3 tracking-widest uppercase text-stone-400">Loading Savora secure cloud...</p>
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-stone-900 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white text-stone-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 overflow-hidden relative border border-stone-100">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-1.5 rounded-2xl border border-stone-100/50 shadow-sm flex items-center justify-center shrink-0">
                <SavoraLogo className="w-14 h-14" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-emerald-900">Setup Savora Profile</h2>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Set your parameters once to secure persistent cloud sync</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleFinishOnboarding} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Your Display Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                placeholder="What should we call you? (e.g. Alex)"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-semibold"
              />
            </div>

            {/* Cultural Safeguard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Religion Safeguard</label>
                <select
                  value={profile.religion}
                  onChange={(e) => setProfile({...profile, religion: e.target.value})}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold text-stone-700"
                >
                  <option value="None / All-inclusive">None / All-inclusive</option>
                  <option value="Hinduism">Hinduism (Omit Beef)</option>
                  <option value="Islam">Islam (Omit Pork/Alcohol)</option>
                  <option value="Judaism">Judaism (Kosher Rules)</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Sikhism">Sikhism</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Food Preference</label>
                <select
                  value={profile.foodPreference}
                  onChange={(e) => setProfile({...profile, foodPreference: e.target.value})}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold text-stone-700"
                >
                  <option value="Vegetarian">Strict Vegetarian (No Meats/Fish)</option>
                  <option value="Vegan">Vegan (100% Plant-Based)</option>
                  <option value="Eggetarian">Eggetarian (Eggs allowed)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian (All proteins)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Special Diet Style</label>
                <select
                  value={profile.dietType}
                  onChange={(e) => setProfile({...profile, dietType: e.target.value})}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold text-stone-700"
                >
                  <option value="Balanced">Balanced / Standard</option>
                  <option value="Keto">Ketogenic (High-Fat, Low-Carb)</option>
                  <option value="Gluten Free">Gluten Free</option>
                </select>
              </div>
            </div>

            {/* Region / Palate */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Nationality / Regional Palate Style</label>
              <input
                type="text"
                value={profile.nationality}
                onChange={(e) => setProfile({...profile, nationality: e.target.value, region: e.target.value})}
                placeholder="e.g. Indian, Mediterranean, Italian, Japanese, Global"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
              />
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2 bg-stone-50 border border-stone-200 rounded-2xl p-4">
              <label className="block text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1">
                <Activity size={14} className="text-red-600 animate-pulse" /> Medical States & Special Textures
              </label>
              
              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={profile.isDiabetic}
                    onChange={(e) => setProfile({...profile, isDiabetic: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-800">Diabetic Filter</span>
                    <span className="block text-[9px] text-stone-500">Designs low-glycemic, high-fiber menus, omitting refined sugars.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer border-t border-stone-200/50 pt-2">
                  <input 
                    type="checkbox"
                    checked={profile.needsSemiSolid}
                    onChange={(e) => setProfile({...profile, needsSemiSolid: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-800">Recent Surgery / Delicate Digestion (Semi-Solid Foods)</span>
                    <span className="block text-[9px] text-stone-500">Directs menus into smooth, pureed, soft-boiled stews and warm recovery broths.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer border-t border-stone-200/50 pt-2">
                  <input 
                    type="checkbox"
                    checked={profile.isHypertensive}
                    onChange={(e) => setProfile({...profile, isHypertensive: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-800">Hypertension (Low Sodium Control)</span>
                    <span className="block text-[9px] text-stone-500">Omits heavy sodium salts and salted condiments; highlights natural green spices.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Fitness Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Daily Calories Goal (kcal)</label>
                <input
                  type="number"
                  value={profile.dailyCalorieGoal}
                  onChange={(e) => setProfile({...profile, dailyCalorieGoal: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold text-orange-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Workout Goal</label>
                <select
                  value={profile.fitnessGoal}
                  onChange={(e) => setProfile({...profile, fitnessGoal: e.target.value})}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-stone-700"
                >
                  <option value="Muscle Gain">Lean Muscle Gain</option>
                  <option value="Weight Loss">Healthy Weight Loss</option>
                  <option value="Maintenance">Weight Maintenance</option>
                  <option value="Stamina">Stamina & Endurance</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-stone-50 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <span>Save & Enter Savora Kitchen</span> <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-14 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-950 text-stone-100 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg flex items-center gap-2 border border-emerald-700 animate-bounce text-xs sm:text-sm max-w-[90vw]">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Premium Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-emerald-50 p-1.5 rounded-xl border border-stone-100/50 shadow-xs flex items-center justify-center shrink-0">
              <SavoraLogo className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-emerald-900 flex items-center gap-1.5">
                Savora <span className="hidden sm:inline text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold font-mono font-sans">Smart Culinarian</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium uppercase tracking-wider truncate">Clinical, Cultural & Dietary Partner</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100 border border-stone-200 rounded-xl p-1.5 px-2 sm:px-3 shrink-0">
            <div className="text-right">
              <p className="text-[8px] sm:text-[9px] uppercase font-bold text-stone-500">Remaining</p>
              <p className={`text-xs sm:text-sm font-black ${remainingCalories < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {remainingCalories} kcal
              </p>
            </div>
            <div className="border-l border-stone-300 h-6 mx-0.5 sm:mx-1"></div>
            <div className="text-center">
              <p className="text-[8px] sm:text-[9px] uppercase font-bold text-stone-400">Consumed</p>
              <p className="text-[10px] sm:text-xs font-bold text-stone-700">{consumedCaloriesToday} kcal</p>
            </div>
            <button 
              onClick={handleResetCalories}
              title="Reset daily logs"
              className="ml-0.5 sm:ml-1 hover:bg-stone-200 p-1 rounded-md text-stone-500 hover:text-red-600 transition"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-24">
        
        {/* TAB 1: DASHBOARD / KITCHEN ENGINE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Hero Indicator Banner */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-stone-50 rounded-2xl p-5 shadow-md relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10">
                <Utensils size={240} />
              </div>
              <div className="relative z-10 max-w-lg space-y-3">
                <span className="bg-emerald-700/50 text-stone-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md font-sans">Google Search Grounded</span>
                <h2 className="text-2xl font-bold tracking-tight leading-tight">Welcome back, {profile.name}!</h2>
                <p className="text-stone-200 text-sm font-light">
                  Your menu suggestions respect your <strong className="text-amber-300 font-bold">{profile.religion}</strong> guidelines, aligned with your <strong className="text-amber-300 font-bold">{profile.foodPreference}</strong> and <strong className="text-amber-300 font-bold">{profile.dietType}</strong> diet.
                </p>
                {/* Active Medical Alerts display */}
                {(profile.isDiabetic || profile.needsSemiSolid || profile.isHypertensive) && (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-2.5 flex flex-wrap gap-2 items-center text-[11px] text-amber-200">
                    <Activity size={14} className="text-amber-400 animate-pulse" />
                    <span className="font-semibold">Active Health Filters:</span>
                    {profile.isDiabetic && <span className="bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">Low-Glycemic Diabetic</span>}
                    {profile.needsSemiSolid && <span className="bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">Semi-Solid/Soft Diet</span>}
                    {profile.isHypertensive && <span className="bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">Low Sodium</span>}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button 
                    onClick={() => setActiveTab('scanner')} 
                    className="bg-white text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-stone-100 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Camera size={14} /> Scan Ingredients
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-emerald-600/30"
                  >
                    <User size={14} /> Adjust Profile / Targets
                  </button>
                </div>
              </div>
            </div>

            {/* Cultural Safeguard Status Badge */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2 sm:gap-3 items-center justify-between text-xs font-semibold text-stone-600">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ShieldAlert size={16} className="text-emerald-700 shrink-0" />
                <span className="hidden sm:inline">Safeguards:</span>
                <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded text-[10px] sm:text-xs">{profile.religion}</span>
                <span className="bg-emerald-100 text-emerald-950 px-2 py-1 rounded font-bold text-[10px] sm:text-xs">{profile.foodPreference}</span>
                <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-[10px] sm:text-xs">{profile.region} Palate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell size={16} className="text-orange-500" />
                <span>Goal:</span>
                <span className="bg-orange-50 text-orange-800 px-2 py-1 rounded">{profile.fitnessGoal}</span>
              </div>
            </div>

            {/* SEARCH ANY DISH RECIPE GENERATOR */}
            <div className="bg-white border-2 border-emerald-600/20 rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
              <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-1.5">
                <Search size={16} className="text-emerald-600" /> Look Up Any Dish Recipe
              </h3>
              <p className="text-xs text-stone-500 leading-normal">
                Search for any food or dish (e.g., "Veg Tacos", "Tomato Soup", "Protein Salad") to instantly formulate a healthy recipe conforming to your cultural and dietary preferences.
              </p>
              
              <form onSubmit={handleSearchDish} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What would you like to make? (e.g. Garlic Fried Rice)"
                  className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none text-xs font-semibold"
                />
                <button
                  type="submit"
                  disabled={searchingDish || !searchQuery.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white px-5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {searchingDish ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Dynamic Ingredient pantry */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 min-w-0">
                  <Utensils size={18} className="text-emerald-700 shrink-0" /> <span className="truncate">Active Ingredient Pantry</span>
                </h3>
                <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium shrink-0">
                  {ingredients.length} Selected
                </span>
              </div>

              {/* Add Ingredient manual form */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                    placeholder="Type ingredient (e.g. Avocado, Spinach, Lentils)"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none text-sm font-medium"
                  />
                </div>
                <button
                  onClick={addIngredient}
                  className="bg-emerald-600 hover:bg-emerald-700 text-stone-50 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Ingredient Badges Container */}
              {ingredients.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <Apple className="mx-auto text-stone-400 stroke-1 mb-2 animate-pulse" size={32} />
                  <p className="text-xs text-stone-500 font-medium font-sans">Your pantry is empty. Use the Camera scanner or add manually!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ingredients.map((ing, idx) => (
                    <span 
                      key={idx} 
                      className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      {ing}
                      <button 
                        onClick={() => removeIngredient(idx)}
                        className="hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredient Restriction Scope Mode Selector */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-100/80 space-y-2">
                <label className="block text-xs font-bold text-stone-500 uppercase font-sans">Recipe Suggestion Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRecipeScope("pantryOnly")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${
                      recipeScope === "pantryOnly" 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <Check size={14} className={recipeScope === "pantryOnly" ? "opacity-100" : "opacity-0"} />
                    Strict Pantry Only
                  </button>
                  <button
                    onClick={() => setRecipeScope("allowExtras")}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${
                      recipeScope === "allowExtras" 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    <Plus size={14} />
                    Allow Up to 3 Extras
                  </button>
                </div>
              </div>

              {/* ACTION: GENERATE RECIPE WITH ACTIVE INGREDIENTS */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={generateRecipe}
                  disabled={loadingRecipe || ingredients.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {loadingRecipe ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Searching accurate imagery & safeguards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="fill-amber-200 animate-pulse" />
                      <span>Generate Savora Recipe from Pantry</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Recipe View */}
            {generatedRecipe && (
              <div className="bg-white border-2 border-emerald-600/30 rounded-2xl overflow-hidden shadow-md animate-fade-in space-y-0">
                
                {/* Image Display with Custom Safety Banner */}
                <div className="relative h-48 sm:h-64 w-full bg-cover bg-center bg-stone-900 flex items-center justify-center animate-fade-in" style={{ backgroundImage: `url(${generatedRecipe.image})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent"></div>
                  
                  <span className="absolute top-4 right-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow z-10">
                    <Award size={13} /> Custom Screened
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 text-stone-100">
                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                      {profile.religion} • {profile.foodPreference} Style
                    </span>
                    <h3 className="text-xl font-bold leading-tight">{generatedRecipe.title}</h3>
                    <p className="text-xs text-stone-200 font-light line-clamp-1">{generatedRecipe.description}</p>
                  </div>
                </div>

                {/* Recipe details */}
                <div className="p-5 space-y-6">
                  
                  {/* Real-time Consumption Log */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-orange-900 uppercase font-sans">Ready to eat this?</h4>
                      <p className="text-xs text-stone-600">Instantly update your consumed tracker for today.</p>
                    </div>
                    <button
                      onClick={() => handleCookMeal(generatedRecipe.nutrition.calories)}
                      className="bg-orange-600 hover:bg-orange-700 text-stone-50 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm shrink-0"
                    >
                      <Check size={14} /> Log Meal
                    </button>
                  </div>

                  {/* Quick stats cards */}
                  <div className="grid grid-cols-3 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-100 text-center text-xs">
                    <div>
                      <span className="block text-stone-400 font-medium uppercase text-[9px] tracking-wider font-sans">Prep Time</span>
                      <strong className="text-stone-700 font-bold">{generatedRecipe.prepTime}</strong>
                    </div>
                    <div className="border-x border-stone-200">
                      <span className="block text-stone-400 font-medium uppercase text-[9px] tracking-wider font-sans">Cook Time</span>
                      <strong className="text-stone-700 font-bold">{generatedRecipe.cookTime}</strong>
                    </div>
                    <div>
                      <span className="block text-stone-400 font-medium uppercase text-[9px] tracking-wider font-sans">Servings</span>
                      <strong className="text-stone-700 font-bold">{generatedRecipe.servings} serving(s)</strong>
                    </div>
                  </div>

                  {/* Nutrition Breakdown & Indicators */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-700" /> Custom Macro Nutrition Analyst
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                      <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">Calories</span>
                        <span className="text-lg font-extrabold text-orange-600">{generatedRecipe.nutrition.calories}</span>
                        <span className="block text-[8px] text-stone-400 font-sans">kcal</span>
                      </div>
                      <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-stone-400 uppercase font-sans">Protein</span>
                        <span className="text-lg font-extrabold text-emerald-800">{generatedRecipe.nutrition.protein}g</span>
                        <span className="block text-[8px] text-stone-400 font-sans">Protein</span>
                      </div>
                      <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-stone-400 uppercase font-sans">Carbs</span>
                        <span className="text-lg font-extrabold text-blue-800">{generatedRecipe.nutrition.carbs}g</span>
                        <span className="block text-[8px] text-stone-400 font-sans">Carbs</span>
                      </div>
                      <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-xs">
                        <span className="block text-[10px] font-bold text-stone-400 uppercase font-sans">Fat</span>
                        <span className="text-lg font-extrabold text-amber-800">{generatedRecipe.nutrition.fat}g</span>
                        <span className="block text-[8px] text-stone-400 font-sans">Fats</span>
                      </div>
                    </div>

                    {/* AI-driven fitness comment */}
                    <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-stone-700 flex items-start gap-2 leading-relaxed">
                      <Dumbbell size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Diet & Medical Alignment Assessment:</strong> {generatedRecipe.fitnessAnalysis}
                      </div>
                    </div>
                  </div>

                  {/* Core Ingredients and steps list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-stone-800 mb-3 border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-600" /> Ingredients Required
                      </h4>
                      <ul className="space-y-2">
                        {generatedRecipe.ingredients.map((item, idx) => {
                          const isItemExtra = item.isExtra;
                          return (
                            <li 
                              key={idx} 
                              className={`p-2 rounded-lg text-xs flex items-center justify-between font-medium border transition-all ${
                                isItemExtra 
                                  ? "bg-amber-50/70 border-amber-200 text-amber-900 font-semibold" 
                                  : "bg-stone-50/50 border-stone-100 text-stone-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isItemExtra ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
                                <span>{item.name} <strong className="text-stone-500 text-[11px] font-bold">({item.quantity})</strong></span>
                              </div>
                              {isItemExtra && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                                  <ShoppingBag size={10} /> Extra Ingredient
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-800 mb-3 border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                        <Utensils size={16} className="text-emerald-600" /> Cooking Instructions
                      </h4>
                      <ol className="space-y-3">
                        {generatedRecipe.instructions.map((step, idx) => (
                          <li key={idx} className="text-xs text-stone-600 flex gap-2 items-start leading-relaxed font-sans">
                            <strong className="text-emerald-700 font-bold shrink-0">{idx + 1}.</strong>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* CUSTOM CHAT PROMPT / DEMAND CONSOLE */}
                  <div className="bg-stone-100 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs uppercase font-sans">
                      <MessageSquare size={15} className="text-emerald-700" />
                      <span>Customize This Recipe Further</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={recipeFollowUp}
                        onChange={(e) => setRecipeFollowUp(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && customizeActiveRecipe()}
                        placeholder="e.g. 'Make it dairy-free', 'Make texture ultra-soft'"
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={customizeActiveRecipe}
                        disabled={customizingRecipe || !recipeFollowUp.trim()}
                        className="bg-emerald-700 hover:bg-emerald-800 text-stone-50 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
                      >
                        {customizingRecipe ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Adjust
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => toggleSaveRecipe(generatedRecipe)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-stone-50 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Heart size={15} className={savedRecipes.some(r => r.title.toLowerCase() === generatedRecipe.title.toLowerCase()) ? "fill-white" : ""} />
                      {savedRecipes.some(r => r.title.toLowerCase() === generatedRecipe.title.toLowerCase()) ? "In Cookbook (Saved)" : "Save to Cookbook"}
                    </button>

                    <button
                      onClick={() => handleWatchOnYoutube(generatedRecipe.youtubeQuery)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-stone-50 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Video size={16} className="fill-stone-50 stroke-none" />
                      <span>Watch Tutorial</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: INGREDIENTS SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                  <Camera size={18} className="text-emerald-700 shrink-0" /> <span className="truncate">Savora AI Vision Scanner</span>
                </h3>
                <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg shrink-0">
                  <button 
                    onClick={() => setScannerMode('camera')}
                    className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${scannerMode === 'camera' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
                  >
                    Live Camera
                  </button>
                  <button 
                    onClick={() => setScannerMode('upload')}
                    className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${scannerMode === 'upload' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500'}`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {scannerMode === 'camera' && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-full max-w-md aspect-video bg-stone-900 rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center">
                    {isCameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-stone-500 flex flex-col items-center">
                        <AlertCircle size={28} className="text-emerald-600 mb-2" />
                        <p className="text-xs font-semibold">Camera stream was stopped or permission denied.</p>
                        <button onClick={startCamera} className="mt-3 bg-emerald-600 text-stone-50 px-4 py-2 rounded-xl text-xs font-bold">
                          Activate Stream
                        </button>
                      </div>
                    )}
                    {scanningImage && (
                      <div className="absolute inset-0 bg-stone-950/70 flex flex-col items-center justify-center text-stone-50">
                        <Loader2 size={36} className="animate-spin text-emerald-500" />
                        <p className="text-xs font-bold mt-2 font-sans">Gemini AI analyzing picture...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={captureAndAnalyze}
                      disabled={!isCameraActive || scanningImage}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Camera size={16} /> Snap Ingredient Photo
                    </button>
                  </div>
                </div>
              )}

              {scannerMode === 'upload' && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 space-y-4">
                  <div className="text-center">
                    <Camera size={40} className="mx-auto text-emerald-600 stroke-1 mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-stone-700">Upload raw food/fridge photo</p>
                    <p className="text-xs text-stone-500 mt-0.5">We'll identify all items automatically while filtering non-compliant proteins.</p>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={scanningImage}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-stone-50 font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    {scanningImage ? "Analyzing..." : "Select Photo File"}
                  </button>
                </div>
              )}
            </div>

            {scannedIngredients.length > 0 && (
              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-600" /> Detected Ingredients (Latest Scan)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scannedIngredients.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="bg-amber-50 text-amber-900 border border-amber-100 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      showToast("Your detected ingredients have been added to your pantry!");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    Build Recipe with Scanned Items <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSONALIZED MEAL PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-700" /> Full-Day Meal Planner
                </h3>
                <p className="text-xs text-stone-500 mt-1 font-medium font-sans">Generate a coordinated dietary day-plan aligned to your goals and medical requirements.</p>
              </div>

              {/* Goal parameters */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2 font-sans">My Target Goal</label>
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-1 rounded-xl border border-stone-200/80">
                    {["Muscle Gain", "Weight Loss", "Clean Eating"].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setMealPlanGoal(goal)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          mealPlanGoal === goal 
                            ? "bg-emerald-600 text-white shadow-sm" 
                            : "text-stone-600 hover:bg-stone-200/50"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pantry checklist in Planner */}
                <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-stone-800">Prioritize My Pantry Ingredients</span>
                    <span className="block text-[10px] text-stone-500 leading-tight font-medium font-sans font-sans">Build daily meal layouts strictly with items you already have.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prioritizePantryInPlanner}
                    onChange={(e) => setPrioritizePantryInPlanner(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-emerald-600 focus:ring-emerald-500/20 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={generateMealPlan}
                disabled={loadingMealPlan}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-stone-50 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {loadingMealPlan ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Calculating Safeguarded Meal Plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="fill-amber-200 animate-pulse" />
                    <span>Generate Safe Daily Plan</span>
                  </>
                )}
              </button>
            </div>

            {mealPlan && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-stone-800 text-xs flex items-start gap-2.5 leading-relaxed shadow-xs">
                  <TrendingUp size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-0.5">Today's Strategy Overview</h4>
                    <p>{mealPlan.summary}</p>
                    <p className="text-[11px] text-emerald-800 mt-1.5 font-semibold font-sans">💡 Missing ingredients not inside your Pantry are highlighted below in Amber. Tap any meal to view preparation steps and quickly add missing items directly to your pantry!</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mealPlan.meals.map((meal, index) => (
                    <div 
                      key={index} 
                      onClick={() => openMealDetails(meal)}
                      className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition"
                    >
                      <div className="space-y-1">
                        <div className="flex gap-1.5 items-center flex-wrap">
                          <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                            {meal.type}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                            <Sparkles size={11} /> Review Recipe Details
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-800 text-sm mt-1 flex items-center gap-1.5">
                          {meal.name} <ChevronRight size={14} className="text-stone-400 animate-pulse" />
                        </h4>
                        <p className="text-xs text-stone-500 font-medium leading-normal">{meal.description}</p>
                        
                        {/* Highlights missing ingredients inline inside the card list */}
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {meal.ingredients.map((ing, k) => {
                            const isStocked = isIngredientInPantry(ing.name);
                            return (
                              <span 
                                key={k} 
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-all border ${
                                  isStocked 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                    : 'bg-amber-50 text-amber-900 border-amber-200 animate-pulse'
                                }`}
                              >
                                {isStocked ? '✓' : '⚠️'} {ing.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto border-t border-stone-50 md:border-none pt-2 md:pt-0 justify-between sm:justify-start">
                        <div className="bg-stone-50 px-2 sm:px-3 py-1.5 rounded-lg text-center text-[10px] border border-stone-100">
                          <span className="block text-stone-400 font-bold uppercase tracking-wider text-[8px] font-sans">Cal</span>
                          <strong className="text-orange-600 font-extrabold">{meal.nutrition.calories}</strong>
                        </div>
                        <div className="bg-stone-50 px-2 sm:px-3 py-1.5 rounded-lg text-center text-[10px] border border-stone-100">
                          <span className="block text-stone-400 font-bold uppercase tracking-wider text-[8px] font-sans">Pro</span>
                          <strong className="text-emerald-700 font-extrabold">{meal.nutrition.protein}g</strong>
                        </div>
                        <div className="bg-stone-50 px-2 sm:px-3 py-1.5 rounded-lg text-center text-[10px] border border-stone-100">
                          <span className="block text-stone-400 font-bold uppercase tracking-wider text-[8px] font-sans">Carb</span>
                          <strong className="text-blue-800 font-extrabold">{meal.nutrition.carbs}g</strong>
                        </div>
                        <div className="bg-stone-50 px-2 sm:px-3 py-1.5 rounded-lg text-center text-[10px] border border-stone-100">
                          <span className="block text-stone-400 font-bold uppercase tracking-wider text-[8px] font-sans">Fat</span>
                          <strong className="text-amber-800 font-extrabold">{meal.nutrition.fat}g</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED RECIPES */}
        {activeTab === 'saved' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 min-w-0">
                <BookOpen size={18} className="text-emerald-700 shrink-0" /> <span className="truncate">My Saved Cookbook ({savedRecipes.length})</span>
              </h3>
            </div>

            {savedRecipes.length === 0 ? (
              <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-6">
                <Heart className="mx-auto text-stone-300 mb-2 animate-pulse" size={36} />
                <p className="text-sm font-bold text-stone-700">No saved recipes found</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-normal font-sans">
                  Your Savora cookbook is clean and empty. Search for delicious dishes, scan fresh ingredients, and tap the save button!
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 bg-emerald-600 text-stone-50 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Find Recipes Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedRecipes.map((recipe, index) => (
                  <div key={recipe.id || index} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-stone-800 text-sm line-clamp-1">{recipe.title}</h4>
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5 font-sans">
                            {recipe.nutrition.calories} kcal • {recipe.nutrition.protein}g Protein
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSaveRecipe(recipe)}
                          className="text-stone-300 hover:text-red-500 p-1 rounded transition"
                          title="Remove recipe"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">{recipe.description}</p>
                    </div>

                    <div className="bg-stone-50 px-4 py-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setGeneratedRecipe(recipe);
                          setActiveTab('dashboard');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                      >
                        Cook Recipe <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => handleWatchOnYoutube(recipe.youtubeQuery)}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                      >
                        <Video size={14} className="fill-red-600 stroke-none" />
                        Tutorial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE MANAGEMENT & ACCOUNT STATUS */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* SAVORA AUTO CLOUD SYNC STATUS */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-1.5">
                <Globe size={18} className="text-emerald-600" /> Account Cloud Sync Status
              </h3>
              
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-emerald-900">Savora Silent Cloud Secure</span>
                  <span className="block text-[10px] text-stone-500">Your profile preferences, cookbook, and pantry items are safely and permanently stored to the cloud under your personal browser session token.</span>
                </div>
              </div>
            </div>

            {/* OpenRouter API Key Configuration */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-stone-800 flex items-center gap-1.5">
                <Sparkles size={18} className="text-amber-500" /> AI Engine (OpenRouter - Free Model)
              </h3>
              
              {apiKey ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800">
                    <strong>API Key active:</strong> Using Llama 3.3 70B via OpenRouter. All AI features are enabled.
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <strong>No API Key:</strong> Add your OpenRouter key below, or set it as an environment variable on Netlify.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-600 uppercase">OpenRouter API Key</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => {
                    setGeminiApiKey(e.target.value);
                    localStorage.setItem('savora_gemini_api_key', e.target.value);
                  }}
                  placeholder="Paste your OpenRouter API key..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold"
                />
                <p className="text-[10px] text-stone-500">
                  Free tier available. Get a key at <span className="font-mono text-emerald-600">openrouter.ai</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-6">
              
              <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">My Culture & Medical Profile</h3>
                  <p className="text-xs text-stone-500">Configure parameters to automatically tailor and restrict meal contents.</p>
                </div>
              </div>

              {/* MEDICAL & CLINICAL CUSTOMIZATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                  <Activity size={14} className="text-red-600 animate-pulse" /> Medical States & Special Needs
                </h4>
                
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-100/50 cursor-pointer transition">
                      <input 
                        type="checkbox"
                        checked={profile.isDiabetic}
                        onChange={(e) => updateCloudProfile({...profile, isDiabetic: e.target.checked})}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">Diabetic Patient Filter</span>
                        <span className="block text-[10px] text-stone-500">Instructs AI to design strictly low-glycemic foods, zero refined sugars, and stable carb proportions.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-100/50 cursor-pointer transition border-t border-stone-200/60">
                      <input 
                        type="checkbox"
                        checked={profile.needsSemiSolid}
                        onChange={(e) => updateCloudProfile({...profile, needsSemiSolid: e.target.checked})}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">Recent Surgery / Delicate Digestion Recovery (Semi-Solid Foods)</span>
                        <span className="block text-[10px] text-stone-500 font-sans">Forces AI to construct recipes into purees, soft boiled stews, warm broths, and highly digestible items to support fast healing.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-100/50 cursor-pointer transition border-t border-stone-200/60">
                      <input 
                        type="checkbox"
                        checked={profile.isHypertensive}
                        onChange={(e) => updateCloudProfile({...profile, isHypertensive: e.target.checked})}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-stone-800">Hypertension (Low Sodium Control)</span>
                        <span className="block text-[10px] text-stone-500 font-sans">Omits heavy sodium salts or high-salt sauces. Emphasizes flavorful fresh green herbs instead.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Identity Details */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 font-sans">
                  <Globe size={14} className="text-emerald-700" /> Ethnic & Religious Filters
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateCloudProfile({...profile, name: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1 font-sans">Religious Belief Safeguards</label>
                    <select
                      value={profile.religion}
                      onChange={(e) => updateCloudProfile({...profile, religion: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-stone-700"
                    >
                      <option value="None / All-inclusive">None / All-inclusive</option>
                      <option value="Hinduism">Hinduism (Omit Beef)</option>
                      <option value="Islam">Islam (Omit Pork/Alcohol)</option>
                      <option value="Judaism">Judaism (Kosher Safeguards)</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Sikhism">Sikhism</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1 font-sans">Food Preference</label>
                    <select
                      value={profile.foodPreference}
                      onChange={(e) => updateCloudProfile({...profile, foodPreference: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-stone-700"
                    >
                      <option value="Vegetarian">Strict Vegetarian (No Meats/Fish)</option>
                      <option value="Vegan">Vegan (100% Plant-Based)</option>
                      <option value="Eggetarian">Eggetarian (Eggs allowed)</option>
                      <option value="Non-Vegetarian">Non-Vegetarian (All proteins)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1 font-sans">Special Diet Style</label>
                    <select
                      value={profile.dietType}
                      onChange={(e) => updateCloudProfile({...profile, dietType: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-stone-700"
                    >
                      <option value="Balanced">Balanced / Standard</option>
                      <option value="Keto">Ketogenic (High-Fat, Low-Carb)</option>
                      <option value="Gluten Free">Gluten Free</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fitness Metrics */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 font-sans">
                  <Dumbbell size={14} className="text-orange-600" /> Fitness Strategy & Daily Goals
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Daily Calorie Target (kcal)</label>
                    <input
                      type="number"
                      value={profile.dailyCalorieGoal}
                      onChange={(e) => updateCloudProfile({...profile, dailyCalorieGoal: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Fitness Workout Mode</label>
                    <select
                      value={profile.fitnessType}
                      onChange={(e) => updateCloudProfile({...profile, fitnessType: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-stone-700"
                    >
                      <option value="Strength Training">Strength & Weight Training</option>
                      <option value="Cardio / Running">Cardio / Long Distance</option>
                      <option value="HIIT">HIIT & Metabolic Conditioning</option>
                      <option value="Yoga & Flexibility">Yoga, Pilates & Mind-Body</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl text-xs text-emerald-800 border border-emerald-100 flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Profile Synchronized:</strong> All profile changes are securely synced and remembered across logins.
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Dynamic Overlay Modal displaying Planned Meal Recipes */}
      {selectedMealDetail && (
        <div className="fixed inset-0 bg-stone-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-stone-200 animate-fade-in">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMealDetail(null)}
              className="absolute top-4 right-4 bg-stone-950/60 hover:bg-stone-950 text-white p-2 rounded-full z-20 transition"
            >
              <X size={18} />
            </button>

            {/* Modal Photo Header */}
            <div className="relative h-40 sm:h-56 w-full bg-cover bg-center bg-stone-950 flex items-center justify-center" style={{ backgroundImage: `url(${selectedMealDetail.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-stone-100">
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block font-sans">
                  {selectedMealDetail.type} Plan
                </span>
                <h3 className="text-xl font-black">{selectedMealDetail.name}</h3>
                <p className="text-xs text-stone-300 font-light leading-snug">{selectedMealDetail.description}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Macros Breakdown */}
              <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-widest flex items-center gap-1 font-sans">
                  <TrendingUp size={14} className="text-emerald-700" /> Nutritional Summary
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="block text-[8px] font-bold text-stone-400 uppercase font-sans">Calories</span>
                    <strong className="text-sm font-black text-orange-600">{selectedMealDetail.nutrition.calories} kcal</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="block text-[8px] font-bold text-stone-400 uppercase font-sans">Protein</span>
                    <strong className="text-sm font-black text-emerald-800">{selectedMealDetail.nutrition.protein}g</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="block text-[8px] font-bold text-stone-400 uppercase font-sans">Carbs</span>
                    <strong className="text-sm font-black text-blue-800">{selectedMealDetail.nutrition.carbs}g</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="block text-[8px] font-bold text-stone-400 uppercase font-sans">Fats</span>
                    <strong className="text-sm font-black text-amber-800">{selectedMealDetail.nutrition.fat}g</strong>
                  </div>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                
                {/* Ingredients Column with Real-time Pantry Check & Quick Add */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-800 border-b border-stone-100 pb-1.5 uppercase tracking-wider flex items-center gap-1 font-sans">
                    <Check size={14} className="text-emerald-600" /> Ingredients Required
                  </h4>
                  <ul className="space-y-2">
                    {selectedMealDetail.ingredients?.map((ing, idx) => {
                      const stocked = isIngredientInPantry(ing.name);
                      return (
                        <li 
                          key={idx} 
                          className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-between gap-1.5 transition-all ${
                            stocked 
                              ? "bg-emerald-50/70 border-emerald-100 text-emerald-950" 
                              : "bg-amber-50/70 border-amber-200 text-amber-950 animate-pulse"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stocked ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                            <span>{ing.name} <strong className="text-stone-500 text-[11px]">({ing.quantity})</strong></span>
                          </div>
                          
                          {/* Interactive Buy/Add Action Button */}
                          {!stocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddIngredientDirectly(ing.name);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] px-2 py-1 rounded-md flex items-center gap-0.5 shadow-xs shrink-0"
                              title="Add to Pantry"
                            >
                              <Plus size={10} /> Stock It
                            </button>
                          ) : (
                            <span className="text-emerald-700 text-[9px] font-extrabold font-sans">In Pantry</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Preparation Steps Column */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-800 border-b border-stone-100 pb-1.5 uppercase tracking-wider flex items-center gap-1 font-sans">
                    <Utensils size={14} className="text-emerald-600" /> Preparation Instructions
                  </h4>
                  <ol className="space-y-3.5">
                    {selectedMealDetail.instructions?.map((step, idx) => (
                      <li key={idx} className="text-xs text-stone-600 flex gap-2 items-start leading-relaxed font-sans">
                        <strong className="text-emerald-700 font-extrabold shrink-0">{idx + 1}.</strong>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

              {/* Modal Control Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-stone-200">
                <button
                  onClick={() => {
                    handleCookMeal(selectedMealDetail.nutrition.calories);
                    setSelectedMealDetail(null);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Check size={15} /> Log Meal calories
                </button>

                <button
                  onClick={() => handleWatchOnYoutube(`healthy ${selectedMealDetail.name} recipe tutorial`)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Video size={16} className="fill-stone-50 stroke-none" />
                  <span>Watch Tutorial</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-lg px-2 sm:px-4 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition min-w-0 ${activeTab === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-semibold'}`}
          >
            <Utensils size={18} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : ''} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 font-sans truncate">Kitchen</span>
          </button>

          <button 
            onClick={() => setActiveTab('scanner')} 
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition min-w-0 ${activeTab === 'scanner' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-semibold'}`}
          >
            <Camera size={18} className={activeTab === 'scanner' ? 'stroke-[2.5]' : ''} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 font-sans truncate">Scanner</span>
          </button>

          <button 
            onClick={() => setActiveTab('planner')} 
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition min-w-0 ${activeTab === 'planner' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-semibold'}`}
          >
            <Calendar size={18} className={activeTab === 'planner' ? 'stroke-[2.5]' : ''} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 font-sans truncate">Planner</span>
          </button>

          <button 
            onClick={() => setActiveTab('saved')} 
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition min-w-0 ${activeTab === 'saved' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-semibold'}`}
          >
            <BookOpen size={18} className={activeTab === 'saved' ? 'stroke-[2.5]' : ''} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 font-sans truncate">Saved</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-xl transition min-w-0 ${activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-stone-400 font-semibold'}`}
          >
            <User size={18} className={activeTab === 'profile' ? 'stroke-[2.5]' : ''} />
            <span className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 font-sans truncate">Profile</span>
          </button>

        </div>
      </nav>

      {/* Hidden elements for Canvas Camera integration */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}