export type Role = 'employer' | 'helper';
export type Language = 'en' | 'id' | 'tg';

export interface User {
  userID: string;
  role: Role;
  fullName?: string;
  languagePreference: Language;
  createTime: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  invitationID: string;
  senderID: string;
  receiverID: string;
  status: InvitationStatus;
  createTime: string;
}

export interface Connection {
  connectionID: string;
  employerID: string;
  helperID: string;
  createTime: string;
}

export interface FamilyMember {
  memberID: string;
  userName: string;
  disease: string; // "diabetes", "hypertension", "none" etc.
  allergy: string; // e.g. "Peanuts", "Seafood", "None"
  tastePreference: 'light' | 'normal' | 'heavy';
}

export interface RecipeStep {
  id: number;
  text: Record<Language, string>;
  image: string;
  voiceUrl?: string;
}

export interface Recipe {
  recipeID: string;
  title: Record<Language, string>;
  subtitle?: Record<Language, string>;
  description: Record<Language, string>;
  category: string;
  prepTime: number; // in mins
  cookTime: number; // in mins
  materialList: string[];
  toolList: string[];
  preCookSteps: RecipeStep[];
  cookSteps: RecipeStep[];
  keyTakeaways?: RecipeStep[];
  tags: string[];
  image?: string;
}

export type TaskStatus =
  | 'created'
  | 'preparing'
  | 'pre_cook_completed'
  | 'prep_approved'
  | 'prep_rejected'
  | 'cooking_ongoing'
  | 'completed'
  | 'ai_checked'
  | 'rated';

export interface Task {
  taskID: string;
  recipeID: string;
  employerID: string;
  helperID: string;
  customPreSteps: string[];
  taskStatus: TaskStatus;
  preCookFinishRate: number; // Percentage 0 - 100
  cookFinishRate: number; // Percentage 0 - 100
  currentPreStepIndex: number;
  currentCookStepIndex: number;
  createTime: string;
  finishTime?: string;
  prepImageUrl?: string;
  cookImageUrl?: string;
  // Adjusted recipes for display/execution based on health profile parameters
  adjustedPreSteps?: RecipeStep[];
  adjustedCookSteps?: RecipeStep[];
}

export interface StepRecord {
  taskID: string;
  stepID: number;
  stepType: 'pre' | 'cook';
  isFinish: boolean;
  confirmTime: string;
}

export interface ChatMessage {
  taskID: string;
  senderRole: Role | string;
  message: string;
  imageUrl?: string;
  createTime: string;
  isRead?: boolean;
}

export interface AIResult {
  taskID: string;
  imageUrl: string;
  aiResult: 'pass' | 'minor_defect';
  feedback: string;
}

export interface Review {
  taskID: string;
  starRate: number;
  comment: string;
  createTime: string;
}
