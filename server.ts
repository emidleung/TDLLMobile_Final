import express from 'express'; // Force sync for cooking image updates v4 (cache-busting)
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { RECIPES } from './src/recipesData';
import {
  User,
  FamilyMember,
  Task,
  TaskStatus,
  RecipeStep,
  ChatMessage,
  AIResult,
  Review,
  Language,
  Invitation,
  Connection
} from './src/types';

// Initialize state (in-memory mock DB for reliable play/persistent feel)
let users: User[] = [
  { userID: 'employer-1', role: 'employer', fullName: 'Trial User', languagePreference: 'en', createTime: new Date().toISOString() },
  { userID: 'helper-1', role: 'helper', fullName: 'Maria', languagePreference: 'en', createTime: new Date().toISOString() },
  { userID: '66924319', role: 'employer', fullName: 'Trial User', email: 'hello@example.com', languagePreference: 'en', createTime: new Date().toISOString() }
];

let familyMembers: FamilyMember[] = [
  { memberID: 'fm-1', userName: 'Arthur (Hubby)', disease: 'Diabetes', allergy: 'Peanuts', tastePreference: 'light' },
  { memberID: 'fm-2', userName: 'Grandma', disease: 'Hypertension', allergy: 'None', tastePreference: 'light' }
];

let tasks: Task[] = [];

let chats: ChatMessage[] = [
  {
    taskID: 'task-1',
    senderRole: 'employer',
    message: "Hi Maria, please make sure the fish is completely descaled and patted dry before steaming. Use the sanitizer on the board!",
    createTime: new Date(Date.now() - 3600000).toISOString(), // 1hr ago
    isRead: true
  },
  {
    taskID: 'task-1',
    senderRole: 'helper',
    message: "Ok Ma'am. I am cleaning the cutting board now and soaking the bok choy. I will share a photo of the prepped fish soon.",
    createTime: new Date(Date.now() - 1800000).toISOString(), // 30m ago
    isRead: true
  },
  {
    taskID: 'task-1',
    senderRole: 'helper',
    message: "I have just uploaded the photo of the prepped sea bass. Please take a look when you have a moment!",
    createTime: new Date(Date.now() - 600000).toISOString(), // 10m ago
    isRead: false
  },
  {
    taskID: 'task-1',
    senderRole: 'employer',
    message: "Hi helper, check this message too.",
    createTime: new Date(Date.now() - 300000).toISOString(),
    isRead: false
  },
  {
    taskID: 'chat_employer-1',
    senderRole: 'helper',
    message: "Master, I have prepped the ingredients as requested.",
    createTime: new Date(Date.now() - 400000).toISOString(),
    isRead: false
  },
  {
    taskID: 'chat_66924319',
    senderRole: 'helper',
    message: "Ready to cook!",
    createTime: new Date(Date.now() - 500000).toISOString(),
    isRead: false
  }
];

let aiResults: AIResult[] = [];
let reviews: Review[] = [
  {
    taskID: 'previous-task',
    starRate: 4,
    comment: 'Fish was delicious and cooked perfectly! Next time please wipe the plate edge before serving.',
    createTime: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

let invitations: Invitation[] = [
  {
    invitationID: 'inv-1',
    senderID: 'helper-2',
    receiverID: 'employer-1',
    status: 'pending',
    createTime: new Date().toISOString()
  },
  {
    invitationID: 'inv-2',
    senderID: 'helper-2',
    receiverID: '66924319',
    status: 'pending',
    createTime: new Date().toISOString()
  },
  {
    invitationID: 'inv-3',
    senderID: 'employer-1',
    receiverID: 'helper-1',
    status: 'pending',
    createTime: new Date().toISOString()
  }
];
let connections: Connection[] = [
  { connectionID: 'conn-1', employerID: 'employer-1', helperID: 'helper-1', createTime: new Date().toISOString() }
];

// Instantiating GoogleGenAI client (safe guarding with optional check)
const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyD1BTTg1OKpE6-iXftAxOCG1B5kyxxb_3g';
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('[AI] GoogleGenAI initialized successfully with key.');
  } catch (err) {
    console.error('[AI] Failed to initialize GoogleGenAI:', err);
  }
} else {
  console.warn('[AI] No GEMINI_API_KEY found. AI analysis will be disabled.');
}

// Smart algorithm helper to adjust a recipe based on health profiles
function adjustRecipeForHealth(recipeId: string, members: FamilyMember[]) {
  const originalRecipe = RECIPES.find(r => r.recipeID === recipeId);
  if (!originalRecipe) return null;

  // Deep clone steps
  let preSteps: RecipeStep[] = JSON.parse(JSON.stringify(originalRecipe.preCookSteps));
  let cookSteps: RecipeStep[] = JSON.parse(JSON.stringify(originalRecipe.cookSteps));

  const warnings: Record<Language, string[]> = { en: [], id: [], tg: [] };

  // Analyze active conditions
  const hasDiabetes = members.some(m => m.disease.toLowerCase().includes('diabetes'));
  const hasHypertension = members.some(m => m.disease.toLowerCase().includes('hyper') || m.disease.toLowerCase().includes('pressure'));
  const allergies = members.map(m => m.allergy.trim().toLowerCase()).filter(a => a && a !== 'none');

  // Adjust pre-cook steps / add cross-contamination checks
  if (allergies.length > 0 && recipeId !== 'cantonese-steamed-fish') {
    const allergyListStr = allergies.join(', ');
    preSteps.unshift({
      id: 0, // Header hygiene step
      text: {
        en: `[ALLERGY WARNING] Clean and sanitize all workstations and knives thoroughly. Ensure zero contact with: ${allergyListStr}.`,
        id: `[PERINGATAN ALERGI] Bersihkan dan sanitasi talenan serta pisau dengan teliti. Pastikan tidak ada kontak dengan: ${allergyListStr}.`,
        tg: `[BABALA SA ALERHIYA] Linisin at i-sanitize ang lahat ng workstation at mga kutsilyo. Siguraduhing walang contact sa: ${allergyListStr}.`
      },
      image: '/recipes/stage1_clean_workstation.png'
    });
  }

  // Adjust processing recipes based on diabetes (reducing sugar / oil)
  if (hasDiabetes) {
    preSteps = preSteps.map(step => {
      // If text contains sugar or oil, suffix with healthy adaptation
      const adjustStep = { ...step };
      (Object.keys(adjustStep.text) as Language[]).forEach(lang => {
        let val = adjustStep.text[lang];
        if (val.toLowerCase().includes('sugar') || val.toLowerCase().includes('gula') || val.toLowerCase().includes('asukal')) {
          adjustStep.text[lang] = val + ' (Diabetes Option: Reduce amount or substitute with sweetener).';
        }
      });
      return adjustStep;
    });

    cookSteps = cookSteps.map(step => {
      const adjustStep = { ...step };
      (Object.keys(adjustStep.text) as Language[]).forEach(lang => {
        let val = adjustStep.text[lang];
        if (val.toLowerCase().includes('sugar') || val.toLowerCase().includes('gula') || val.toLowerCase().includes('asukal')) {
          adjustStep.text[lang] = val + ' (Diabetic Option: OMIT or use stevia / minimum sweetness).';
        }
        if (val.toLowerCase().includes('oil') || val.toLowerCase().includes('minyak') || val.toLowerCase().includes('mantika')) {
          adjustStep.text[lang] = val.replace(/oil|minyak|mantika/gi, 'healthy spray oil (minimized amount)');
        }
      });
      return adjustStep;
    });
  }

  // Adjust processing recipes based on hypertension (reducing salt / soy)
  if (hasHypertension) {
    cookSteps = cookSteps.map(step => {
      const adjustStep = { ...step };
      (Object.keys(adjustStep.text) as Language[]).forEach(lang => {
        let val = adjustStep.text[lang];
        if (val.toLowerCase().includes('salt') || val.toLowerCase().includes('soy sauce') || val.toLowerCase().includes('garam') || val.toLowerCase().includes('kecap') || val.toLowerCase().includes('asin')) {
          adjustStep.text[lang] = val + ' (Hypertension diet: Reduce salt / soy sauce by 50% for low-sodium).';
        }
      });
      return adjustStep;
    });
  }

  // Renumber indices to maintain step sequence integrity
  preSteps = preSteps.map((s, idx) => ({ ...s, id: idx + 1 }));
  cookSteps = cookSteps.map((s, idx) => ({ ...s, id: idx + 1 }));

  return { preSteps, cookSteps };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API 1: User Profile & Preferences
  app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.userID === req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/users/preference', (req, res) => {
    const { userID, languagePreference } = req.body;
    const idx = users.findIndex(u => u.userID === userID);
    if (idx !== -1) {
      users[idx].languagePreference = languagePreference as Language;
      res.json(users[idx]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // API 2: Family Health Profiles
  app.get('/api/family-members', (req, res) => {
    res.json(familyMembers);
  });

  app.post('/api/family-members', (req, res) => {
    const { userName, disease, allergy, tastePreference } = req.body;
    const newMember: FamilyMember = {
      memberID: `fm-${Date.now()}`,
      userName: userName || 'New Member',
      disease: disease || 'None',
      allergy: allergy || 'None',
      tastePreference: tastePreference || 'normal'
    };
    familyMembers.push(newMember);
    res.json(newMember);
  });

  app.delete('/api/family-members/:id', (req, res) => {
    familyMembers = familyMembers.filter(m => m.memberID !== req.params.id);
    res.json({ success: true });
  });

  // API 3: Recipes Catalog
  app.get('/api/recipes', (req, res) => {
    // Returns recipes list
    res.json(RECIPES);
  });

  // Adjust specific recipe parameters preview dynamically
  app.get('/api/recipes/:id/adjusted', (req, res) => {
    const id = req.params.id;
    const adjusted = adjustRecipeForHealth(id, familyMembers);
    if (!adjusted) {
      res.status(404).json({ error: 'Recipe not found' });
    } else {
      res.json({
        recipe: RECIPES.find(r => r.recipeID === id),
        ...adjusted
      });
    }
  });

  // API 4: Tasks state machine (Pre-cooking VS Cooking strict locks)
  app.get('/api/tasks', (req, res) => {
    // Attach dynamically calculated steps for ongoing tasks
    const activeTasks = tasks.map(t => {
      const adjustment = adjustRecipeForHealth(t.recipeID, familyMembers);
      return {
        ...t,
        adjustedPreSteps: adjustment?.preSteps || [],
        adjustedCookSteps: adjustment?.cookSteps || []
      };
    });
    res.json(activeTasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { recipeID, customPreSteps, assignedHelperID } = req.body;
    const recipe = RECIPES.find(r => r.recipeID === recipeID);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const adjustment = adjustRecipeForHealth(recipeID, familyMembers);

    const newTask: Task = {
      taskID: `task-${Date.now()}`,
      recipeID,
      employerID: 'employer-1',
      helperID: assignedHelperID || 'helper-1',
      customPreSteps: customPreSteps || [],
      taskStatus: 'preparing',
      preCookFinishRate: 0,
      cookFinishRate: 0,
      currentPreStepIndex: 0,
      currentCookStepIndex: 0,
      createTime: new Date().toISOString()
    };

    tasks.push(newTask);
    res.json({
      ...newTask,
      adjustedPreSteps: adjustment?.preSteps || [],
      adjustedCookSteps: adjustment?.cookSteps || []
    });
  });

  // Upload preparation photo
  app.post('/api/tasks/:id/upload-prep-photo', (req, res) => {
    const task = tasks.find(t => t.taskID === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { imageUrl } = req.body;
    if (imageUrl) {
      task.prepImageUrl = imageUrl;
      task.taskStatus = 'pre_cook_completed';
    }
    
    res.json(task);
  });

  // Employer reviews the preparation
  app.post('/api/tasks/:id/review-prep', (req, res) => {
    const task = tasks.find(t => t.taskID === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { isApproved } = req.body;
    if (isApproved) {
      task.taskStatus = 'prep_approved';
    } else {
      task.taskStatus = 'prep_rejected';
      // Reset prep progress for redo
      task.preCookFinishRate = 0;
      task.currentPreStepIndex = 0;
      task.prepImageUrl = undefined;
    }
    
    res.json(task);
  });

  // Final dish rejection (after AI check)
  app.post('/api/tasks/:id/reject-dish', (req, res) => {
    const task = tasks.find(t => t.taskID === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.taskStatus = 'prep_rejected'; // Using this to trigger rejection message
    task.preCookFinishRate = 0;
    task.cookFinishRate = 0;
    task.currentPreStepIndex = 0;
    task.currentCookStepIndex = 0;
    task.prepImageUrl = undefined;
    task.cookImageUrl = undefined;
    
    // Clear AI results for this task
    aiResults = aiResults.filter(r => r.taskID !== task.taskID);

    res.json(task);
  });

  // Update step progress (with backend lock validation)
  app.post('/api/tasks/:id/step', (req, res) => {
    const task = tasks.find(t => t.taskID === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { type, stepID, isFinish } = req.body; // type: 'pre' | 'cook'
    const adjustment = adjustRecipeForHealth(task.recipeID, familyMembers);
    const totalPreSteps = (adjustment?.preSteps.length || 0) + task.customPreSteps.length;
    const totalCookSteps = adjustment?.cookSteps.length || 0;

    if (type === 'pre') {
      if (isFinish) {
        // Enforce sequence - advance pre step index
        if (stepID >= task.currentPreStepIndex) {
          task.currentPreStepIndex = stepID + 1;
        }
      } else {
        task.currentPreStepIndex = Math.max(0, stepID);
      }

      // Calculate Pre-cooking rate
      const completedCount = task.currentPreStepIndex;
      task.preCookFinishRate = Math.min(100, Math.round((completedCount / totalPreSteps) * 100));

      if (task.preCookFinishRate < 100) {
        task.taskStatus = 'preparing';
      } else {
        task.taskStatus = 'pre_cook_completed';
      }
    } else if (type === 'cook') {
      task.taskStatus = 'cooking_ongoing';

      if (isFinish) {
        if (stepID >= task.currentCookStepIndex) {
          task.currentCookStepIndex = stepID + 1;
        }
      } else {
        task.currentCookStepIndex = Math.max(0, stepID);
      }

      const completedCount = task.currentCookStepIndex;
      task.cookFinishRate = Math.min(100, Math.round((completedCount / totalCookSteps) * 100));

      if (task.cookFinishRate >= 100) {
        task.taskStatus = 'completed';
        task.finishTime = new Date().toISOString();
      }
    }

    res.json({
      ...task,
      adjustedPreSteps: adjustment?.preSteps || [],
      adjustedCookSteps: adjustment?.cookSteps || []
    });
  });

  // Reset Task back to preparing
  app.post('/api/tasks/:id/reset', (req, res) => {
    const task = tasks.find(t => t.taskID === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.taskStatus = 'preparing';
    task.preCookFinishRate = 0;
    task.cookFinishRate = 0;
    task.currentPreStepIndex = 0;
    task.currentCookStepIndex = 0;
    aiResults = aiResults.filter(r => r.taskID !== task.taskID);
    res.json(task);
  });

  // API 5: Chats with task scoping
  app.get('/api/chats', (req, res) => {
    res.json(chats);
  });

  app.post('/api/chats', (req, res) => {
    const { taskID, senderRole, message, imageUrl } = req.body;
    const newMessage: ChatMessage = {
      taskID: taskID || 'task-1',
      senderRole: senderRole || 'helper',
      message: message || '',
      imageUrl: imageUrl || undefined,
      createTime: new Date().toISOString(),
      isRead: false
    };
    chats.push(newMessage);
    res.json(newMessage);
  });

  app.post('/api/chats/read', (req, res) => {
    const { taskID, readerRole } = req.body;
    chats.forEach(chat => {
      if (chat.taskID === taskID && chat.senderRole !== readerRole) {
        chat.isRead = true;
      }
    });
    res.json({ success: true });
  });

  // API 6: Ratings/reviews
  app.get('/api/reviews', (req, res) => {
    res.json(reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const { taskID, starRate, comment } = req.body;
    const newReview: Review = {
      taskID,
      starRate: starRate || 5,
      comment: comment || '',
      createTime: new Date().toISOString()
    };
    reviews.push(newReview);

    // Lock up overall flow
    const task = tasks.find(t => t.taskID === taskID);
    if (task) {
      task.taskStatus = 'rated';
    }

    res.json(newReview);
  });

  // API 7: Connection & Invitation System
  app.get('/api/invitations/:userId', (req, res) => {
    const userId = req.params.userId;
    // Return invitations where this user is either the receiver or sender AND status is pending
    const pending = invitations.filter(inv => (inv.receiverID === userId || inv.senderID === userId) && inv.status === 'pending');
    res.json(pending);
  });

  app.post('/api/invitations', (req, res) => {
    const { senderID, receiverID } = req.body;
    
    // Check if pending invitation already exists
    const existing = invitations.find(inv => inv.senderID === senderID && inv.receiverID === receiverID && inv.status === 'pending');
    if (existing) {
      return res.json(existing);
    }
    
    const newInv: Invitation = {
      invitationID: `inv-${Date.now()}`,
      senderID,
      receiverID,
      status: 'pending',
      createTime: new Date().toISOString()
    };
    invitations.push(newInv);
    res.json(newInv);
  });

  app.post('/api/invitations/:id/accept', (req, res) => {
    const invId = req.params.id;
    const { roleOfSender } = req.body; // 'employer' | 'helper'
    
    const inv = invitations.find(i => i.invitationID === invId);
    if (!inv) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    inv.status = 'accepted';
    
    // Create connection
    const newConn: Connection = {
      connectionID: `conn-${Date.now()}`,
      employerID: roleOfSender === 'employer' ? inv.senderID : inv.receiverID,
      helperID: roleOfSender === 'helper' ? inv.senderID : inv.receiverID,
      createTime: new Date().toISOString()
    };
    connections.push(newConn);
    
    res.json({ invitation: inv, connection: newConn });
  });

  app.post('/api/invitations/:id/reject', (req, res) => {
    const invId = req.params.id;
    const inv = invitations.find(i => i.invitationID === invId);
    if (!inv) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    inv.status = 'rejected';
    res.json(inv);
  });

  app.get('/api/connections/:userId', (req, res) => {
    const userId = req.params.userId;
    const userConns = connections.filter(c => c.employerID === userId || c.helperID === userId);
    res.json(userConns);
  });

  app.delete('/api/connections/:id', (req, res) => {
    const connId = req.params.id;
    connections = connections.filter(c => c.connectionID !== connId);
    res.json({ success: true });
  });

  // API 8: AI Plating visual check using server-side Gemini SDK
  app.post('/api/ai-check', async (req, res) => {
    const { taskID, imageUrl } = req.body;
    const task = tasks.find(t => t.taskID === taskID);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const recipe = RECIPES.find(r => r.recipeID === task.recipeID);
    const dishTitle = recipe ? recipe.title.en : 'dish';

    console.log(`[AI] Analyzing task ${taskID} for dish: ${dishTitle}...`);

    let selectedAIStatus: 'pass' | 'minor_defect' = 'minor_defect';
    let selectedAIFeedback = "AI Analysis failed to start.";

    if (ai && imageUrl) {
      try {
        // Strip base64 headers and get MIME type
        const mimeTypeMatch = imageUrl.match(/^data:(image\/.+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64Data = imageUrl.replace(/^data:.+;base64,/, '');

        console.log(`[AI] Image size: ${Math.round(base64Data.length / 1024)} KB, MIME: ${mimeType}`);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: `You are a strict Culinary Auditor. Your goal is to detect non-food items, wrong dishes, or poor quality.
TARGET DISH: "${dishTitle}"

INSTRUCTIONS:
1. IDENTIFY: What is in this photo?
2. VALIDATE: Is this exactly the dish "${dishTitle}"?
3. FAIL IMMEDIATELY IF:
   - The image is NOT food (e.g., person, doll, drawing, text, room).
   - The image is the WRONG dish (e.g., if it's chicken but should be fish).
   - The image is too blurry to see clearly.
   - There are hands, feet, or random objects obstructing the food.
4. AUDIT QUALITY: If (and only if) it is the correct dish, check for plate cleanliness (rim spills) and cooking quality.

Respond ONLY with a valid JSON object:
{
  "rating": "Pass" or "Fail",
  "explanation": "State clearly what you see and why it passed or failed."
}`
              }
            ]
          }],
          config: { 
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rating: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['rating', 'explanation']
            }
          }
        });

        let textOutput = '';
        try {
          // Attempt to get text using SDK helper if available
          if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
            textOutput = response.candidates[0].content.parts[0].text;
          } else if (typeof (response as any).text === 'function') {
            textOutput = (response as any).text();
          } else {
            textOutput = JSON.stringify(response);
          }
        } catch (e) {
          textOutput = JSON.stringify(response);
        }

        console.log("Extracted AI Text:", textOutput);
        
        let parsed: any = {};
        try {
          // Clean the string if it contains markdown code blocks
          const cleanedText = textOutput.replace(/```json\n?|\n?```/g, '').trim();
          parsed = JSON.parse(cleanedText);
        } catch (e) {
          console.error("Failed to parse AI JSON:", textOutput);
        }

        console.log("Parsed Rating:", parsed.rating);
        
        selectedAIStatus = (parsed.rating && parsed.rating.toLowerCase().includes('pass')) ? 'pass' : 'minor_defect';
        selectedAIFeedback = parsed.explanation || "No explanation provided by AI.";
      } catch (err: any) {
        console.error('[AI] Gemini call failed:', err);
        selectedAIStatus = 'minor_defect';
        if (err.status === 429 || (err.message && err.message.includes('quota'))) {
          selectedAIFeedback = "CRITICAL: Gemini API Quota Exceeded. The AI cannot analyze your dish right now. Please check your Google Cloud billing or wait for the quota to reset.";
        } else {
          selectedAIFeedback = "The AI auditor encountered an error (" + (err.message || 'Unknown') + "). Please ensure you are uploading a clear photo of the dish for manual employer review.";
        }
      }
    } else {
      console.error('[AI] AI client missing or Image URL empty');
      selectedAIStatus = 'minor_defect';
      selectedAIFeedback = "AI Service is not properly configured. Please check your API key.";
    }

    const aiResNode: AIResult = {
      taskID,
      imageUrl,
      aiResult: selectedAIStatus,
      feedback: selectedAIFeedback
    };

    // Store globally & update status
    aiResults = aiResults.filter(r => r.taskID !== taskID);
    aiResults.push(aiResNode);
    task.taskStatus = 'ai_checked';
    task.cookImageUrl = imageUrl;

    res.json(aiResNode);
  });

  // Get active AI checks
  app.get('/api/ai-check/:taskID', (req, res) => {
    const result = aiResults.find(r => r.taskID === req.params.taskID);
    res.json(result || null);
  });

  // Dev server Setup using Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
