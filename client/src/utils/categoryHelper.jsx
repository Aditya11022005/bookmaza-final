import { 
  Layers, Briefcase, Heart, Cpu, Coffee, Sparkles, BookOpen, 
  Flame, Music, Compass, GraduationCap, Users, Utensils
} from 'lucide-react';

export const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase().trim();
  
  if (lower.includes('romance') || lower.includes('प्रेम') || lower.includes('लव्ह')) return Heart;
  if (lower.includes('science') || lower.includes('tech') || lower.includes('विज्ञान') || lower.includes('संगणक')) return Cpu;
  if (lower.includes('business') || lower.includes('finance') || lower.includes('व्यवसाय') || lower.includes('अर्थशास्त्र')) return Briefcase;
  if (lower.includes('biography') || lower.includes('चरित्र') || lower.includes('आत्मचरित्र')) return Coffee;
  if (lower.includes('self-help') || lower.includes('self help') || lower.includes('motivation') || lower.includes('अध्यात्म') || lower.includes('प्रेरणा') || lower.includes('योग') || lower.includes('मनोविज्ञान')) return Sparkles;
  if (lower.includes('poetry') || lower.includes('poem') || lower.includes('कविता') || lower.includes('काव्य') || lower.includes('कला')) return Music;
  if (lower.includes('thriller') || lower.includes('mystery') || lower.includes('horror') || lower.includes('रहस्य') || lower.includes('भयकथा') || lower.includes('गुन्हेगारी')) return Flame;
  if (lower.includes('travel') || lower.includes('adventure') || lower.includes('पर्यटन') || lower.includes('प्रवास')) return Compass;
  if (lower.includes('education') || lower.includes('academic') || lower.includes('शिक्षण') || lower.includes('अभ्यास') || lower.includes('माहिती')) return GraduationCap;
  if (lower.includes('social') || lower.includes('family') || lower.includes('कुटुंब') || lower.includes('बालसाहित्य') || lower.includes('समाज') || lower.includes('नातेसंबंध')) return Users;
  if (lower.includes('cooking') || lower.includes('recipe') || lower.includes('पाककला') || lower.includes('जेवण')) return Utensils;
  if (lower.includes('history') || lower.includes('historical') || lower.includes('इतिहास') || lower.includes('ऐतिहासिक')) return Layers;
  if (lower.includes('fiction') || lower.includes('novel') || lower.includes('कादंबरी') || lower.includes('कथा') || lower.includes('गोष्टी') || lower.includes('साहित्य')) return BookOpen;

  return BookOpen;
};

export const getCategoryEmoji = (name = '') => {
  const lower = name.toLowerCase().trim();
  
  if (lower.includes('romance') || lower.includes('प्रेम') || lower.includes('लव्ह')) return '❤️';
  if (lower.includes('science') || lower.includes('tech') || lower.includes('विज्ञान') || lower.includes('संगणक')) return '🧬';
  if (lower.includes('business') || lower.includes('finance') || lower.includes('व्यवसाय') || lower.includes('अर्थशास्त्र')) return '💼';
  if (lower.includes('biography') || lower.includes('चरित्र') || lower.includes('आत्मचरित्र')) return '☕';
  if (lower.includes('self-help') || lower.includes('self help') || lower.includes('motivation') || lower.includes('अध्यात्म') || lower.includes('प्रेरणा') || lower.includes('योग') || lower.includes('मनोविज्ञान')) return '🧠';
  if (lower.includes('poetry') || lower.includes('poem') || lower.includes('कविता') || lower.includes('काव्य') || lower.includes('कला')) return '🎭';
  if (lower.includes('thriller') || lower.includes('mystery') || lower.includes('horror') || lower.includes('रहस्य') || lower.includes('भयकथा') || lower.includes('गुन्हेगारी')) return '🔥';
  if (lower.includes('travel') || lower.includes('adventure') || lower.includes('पर्यटन') || lower.includes('प्रवास')) return '🧭';
  if (lower.includes('education') || lower.includes('academic') || lower.includes('शिक्षण') || lower.includes('अभ्यास') || lower.includes('माहिती')) return '🎓';
  if (lower.includes('social') || lower.includes('family') || lower.includes('कुटुंब') || lower.includes('बालसाहित्य') || lower.includes('समाज') || lower.includes('नातेसंबंध')) return '👥';
  if (lower.includes('cooking') || lower.includes('recipe') || lower.includes('पाककला') || lower.includes('जेवण')) return '🍳';
  if (lower.includes('history') || lower.includes('historical') || lower.includes('इतिहास') || lower.includes('ऐतिहासिक')) return '🏛️';
  if (lower.includes('fiction') || lower.includes('novel') || lower.includes('कादंबरी') || lower.includes('कथा') || lower.includes('गोष्टी') || lower.includes('साहित्य')) return '📚';

  return '✨';
};
