import { Strength, Virtue, UserProfile } from './types';
import { 
  Heart, 
  Globe, 
  Target, 
  Search, 
  Sunset, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Scale, 
  HandHeart, 
  BookOpen, 
  Gavel, 
  HeartHandshake, 
  UserMinus, 
  Lightbulb, 
  Tent, 
  Laugh, 
  Gift, 
  Zap, 
  MountainSnow, 
  Brain, 
  Flame, 
  Flag
} from 'lucide-react';
import React from 'react';

// Using lucide-react icons mapped to the concepts in the PDF
export const STRENGTH_ICONS: Record<number, React.ElementType> = {
  1: Heart, // Love
  2: Globe, // Perspective
  3: Target, // Self-Regulation
  4: Search, // Curiosity
  5: Sunset, // Appreciation of Beauty
  6: ShieldCheck, // Honesty
  7: Sparkles, // Spirituality
  8: Users, // Social Intelligence
  9: Scale, // Prudence
  10: HandHeart, // Kindness
  11: BookOpen, // Love of Learning
  12: Gavel, // Fairness
  13: HeartHandshake, // Forgiveness
  14: UserMinus, // Humility
  15: Lightbulb, // Creativity
  16: Users, // Teamwork (reusing Users but distinct in context)
  17: Laugh, // Humor
  18: Gift, // Gratitude
  19: Sparkles, // Hope (reusing Sparkles)
  20: Zap, // Zest
  21: MountainSnow, // Perseverance
  22: Brain, // Judgment
  23: Flame, // Bravery
  24: Flag, // Leadership
};

export const VIRTUE_COLORS: Record<Virtue, string> = {
  [Virtue.WISDOM]: 'bg-blue-100 text-blue-600 border-blue-200',
  [Virtue.COURAGE]: 'bg-rose-100 text-rose-600 border-rose-200',
  [Virtue.HUMANITY]: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  [Virtue.JUSTICE]: 'bg-purple-100 text-purple-600 border-purple-200',
  [Virtue.TEMPERANCE]: 'bg-amber-100 text-amber-600 border-amber-200',
  [Virtue.TRANSCENDENCE]: 'bg-sky-100 text-sky-600 border-sky-200',
};

// Vibrant gradients for the Garden cards
export const VIRTUE_BG_COLORS: Record<Virtue, string> = {
  [Virtue.WISDOM]: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-200',
  [Virtue.COURAGE]: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 hover:shadow-rose-200',
  [Virtue.HUMANITY]: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-emerald-200',
  [Virtue.JUSTICE]: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-purple-200',
  [Virtue.TEMPERANCE]: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-amber-200',
  [Virtue.TRANSCENDENCE]: 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 hover:shadow-sky-200',
};

export const ALL_STRENGTHS: Strength[] = [
  { id: 1, name: "Love", virtue: Virtue.HUMANITY, description: "Valuing close relations with others." },
  { id: 2, name: "Perspective", virtue: Virtue.WISDOM, description: "Providing wise counsel; having a worldview." },
  { id: 3, name: "Self-Regulation", virtue: Virtue.TEMPERANCE, description: "Regulating what one feels and does." },
  { id: 4, name: "Curiosity", virtue: Virtue.WISDOM, description: "Taking an interest in ongoing experience." },
  { id: 5, name: "Appreciation of Beauty", virtue: Virtue.TRANSCENDENCE, description: "Noticing and appreciating beauty/excellence." },
  { id: 6, name: "Honesty", virtue: Virtue.COURAGE, description: "Speaking the truth; presenting oneself genuinely." },
  { id: 7, name: "Spirituality", virtue: Virtue.TRANSCENDENCE, description: "Beliefs about higher purpose and meaning." },
  { id: 8, name: "Social Intelligence", virtue: Virtue.HUMANITY, description: "Awareness of motives/feelings of self/others." },
  { id: 9, name: "Prudence", virtue: Virtue.TEMPERANCE, description: "Being careful about choices; avoiding undue risk." },
  { id: 10, name: "Kindness", virtue: Virtue.HUMANITY, description: "Doing favors and good deeds for others." },
  { id: 11, name: "Love of Learning", virtue: Virtue.WISDOM, description: "Mastering new skills, topics, and bodies of knowledge." },
  { id: 12, name: "Fairness", virtue: Virtue.JUSTICE, description: "Treating all people the same according to justice." },
  { id: 13, name: "Forgiveness", virtue: Virtue.TEMPERANCE, description: "Forgiving those who have done wrong." },
  { id: 14, name: "Humility", virtue: Virtue.TEMPERANCE, description: "Letting one's accomplishments speak for themselves." },
  { id: 15, name: "Creativity", virtue: Virtue.WISDOM, description: "Thinking of novel and productive ways to do things." },
  { id: 16, name: "Teamwork", virtue: Virtue.JUSTICE, description: "Working well as a member of a group or team." },
  { id: 17, name: "Humor", virtue: Virtue.TRANSCENDENCE, description: "Liking to laugh and tease; bringing smiles." },
  { id: 18, name: "Gratitude", virtue: Virtue.TRANSCENDENCE, description: "Being aware of and thankful for good things." },
  { id: 19, name: "Hope", virtue: Virtue.TRANSCENDENCE, description: "Expecting the best in the future." },
  { id: 20, name: "Zest", virtue: Virtue.COURAGE, description: "Approaching life with excitement and energy." },
  { id: 21, name: "Perseverance", virtue: Virtue.COURAGE, description: "Finishing what one starts." },
  { id: 22, name: "Judgment", virtue: Virtue.WISDOM, description: "Thinking things through and examining from all sides." },
  { id: 23, name: "Bravery", virtue: Virtue.COURAGE, description: "Not shrinking from threat, challenge, or pain." },
  { id: 24, name: "Leadership", virtue: Virtue.JUSTICE, description: "Encouraging a group to get things done." }
];

// Default strengths to assign if the user skips (Common top strengths)
export const DEFAULT_TOP_STRENGTHS = [10, 6, 18, 4, 1]; // Kindness, Honesty, Gratitude, Curiosity, Love

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  gender: '',
  pronouns: '',
  occupation: '',
  pets: [],
  children: [],
  topStrengths: [],
  isOnboarded: false
};

// Activity counts required to reach each level (Index 1 = Level 1, etc.)
export const LEVEL_THRESHOLDS = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55];

export const ASSESSMENT_QUESTIONS = [
  { id: 1, text: "I deeply value my close relationships with others.", strengthId: 1 }, // Love
  { id: 2, text: "People often turn to me for advice.", strengthId: 2 }, // Perspective
  { id: 3, text: "I am a disciplined person.", strengthId: 3 }, // Self-Regulation
  { id: 4, text: "I am always curious about the world.", strengthId: 4 }, // Curiosity
  { id: 5, text: "I often stop to admire things that are beautiful.", strengthId: 5 }, // Appreciation of Beauty
  { id: 6, text: "I always speak the truth, even when it is hard.", strengthId: 6 }, // Honesty
  { id: 7, text: "I believe there is a higher purpose to life.", strengthId: 7 }, // Spirituality
  { id: 8, text: "I know how to fit in to different social situations.", strengthId: 8 }, // Social Intelligence
  { id: 9, text: "I think carefully before I make decisions.", strengthId: 9 }, // Prudence
  { id: 10, text: "I enjoy doing favors for others.", strengthId: 10 }, // Kindness
  { id: 11, text: "I am always learning something new.", strengthId: 11 }, // Love of Learning
  { id: 12, text: "I treat everyone equally and fairly.", strengthId: 12 }, // Fairness
  { id: 13, text: "I forgive others easily.", strengthId: 13 }, // Forgiveness
  { id: 14, text: "I am humble about my achievements.", strengthId: 14 }, // Humility
  { id: 15, text: "I come up with new and creative ideas.", strengthId: 15 }, // Creativity
  { id: 16, text: "I work well in a team.", strengthId: 16 }, // Teamwork
  { id: 17, text: "I love to make people laugh.", strengthId: 17 }, // Humor
  { id: 18, text: "I am thankful for what I have.", strengthId: 18 }, // Gratitude
  { id: 19, text: "I am optimistic about the future.", strengthId: 19 }, // Hope
  { id: 20, text: "I have lots of energy and enthusiasm.", strengthId: 20 }, // Zest
  { id: 21, text: "I finish what I start.", strengthId: 21 }, // Perseverance
  { id: 22, text: "I weigh all the evidence before changing my mind.", strengthId: 22 }, // Judgment
  { id: 23, text: "I stand up for what is right, even if I stand alone.", strengthId: 23 }, // Bravery
  { id: 24, text: "I am good at organizing group activities.", strengthId: 24 }, // Leadership
  { id: 25, text: "I am most happy when I am helping others.", strengthId: 10 }, // Kindness
  { id: 26, text: "I love exploring new places and things.", strengthId: 4 }, // Curiosity
  { id: 27, text: "I am an honest person.", strengthId: 6 }, // Honesty
  { id: 28, text: "I do not give up easily.", strengthId: 21 }, // Perseverance
  { id: 29, text: "I expect good things to happen.", strengthId: 19 }, // Hope
  { id: 30, text: "I am capable of loving and being loved.", strengthId: 1 }, // Love
];