// PomiABSPro - Voice Coach Hook (Text-to-Speech)
import { useCallback, useRef, useEffect } from 'react';
import { Language } from '@/lib/i18n';

interface VoiceCoachOptions {
  language: Language;
  enabled: boolean;
  userName?: string;
  volume?: number;
}

const motivationalPhrasesEs = [
  "¡Vamos, {name}! Tú puedes.",
  "Sigue así, {name}. Sin excusas.",
  "Una rep más, {name}.",
  "El dolor es temporal, {name}.",
  "Eso es, {name}. Disciplina.",
  "No te rindas, {name}.",
  "Fuerte, {name}. Más fuerte.",
  "{name}, estás mejorando.",
  "Concéntrate, {name}.",
  "Respira y continúa, {name}.",
  "Buen ritmo, {name}.",
  "Cada rep cuenta, {name}.",
];

const motivationalPhrasesEn = [
  "Let's go, {name}! You got this.",
  "Keep going, {name}. No excuses.",
  "One more rep, {name}.",
  "Pain is temporary, {name}.",
  "That's it, {name}. Discipline.",
  "Don't quit, {name}.",
  "Strong, {name}. Stronger.",
  "{name}, you're improving.",
  "Focus, {name}.",
  "Breathe and continue, {name}.",
  "Good pace, {name}.",
  "Every rep counts, {name}.",
];

// Time milestones for announcements
const timeMilestonesEs: Record<number, string> = {
  5: "¡{name}, 5 minutos de fuego! ¡Excelente ritmo!",
  10: "¡10 minutos, {name}! ¡Sigue empujando!",
  20: "¡20 minutos de puro esfuerzo, {name}! ¡Eres una máquina!",
  30: "¡Media hora, {name}! ¡Nivel guerrero alcanzado!",
  45: "¡45 minutos, {name}! ¡Esto es élite!",
};

const timeMilestonesEn: Record<number, string> = {
  5: "{name}, 5 minutes of fire! Great pace!",
  10: "10 minutes, {name}! Keep pushing!",
  20: "20 minutes of pure effort, {name}! You're a machine!",
  30: "Half hour, {name}! Warrior level achieved!",
  45: "45 minutes, {name}! This is elite!",
};

export const useVoiceCoach = ({ language, enabled, userName, volume = 1.0 }: VoiceCoachOptions) => {
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phraseIndexRef = useRef(0);
  const announcedMilestonesRef = useRef<Set<number>>(new Set());

  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const langCode = language === 'es' ? 'es' : 'en';
    
    // Try to find a voice for the language
    const voice = voices.find(v => v.lang.startsWith(langCode)) || voices[0];
    return voice;
  }, [language]);

  const speak = useCallback((text: string) => {
    if (!enabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.lang = language === 'es' ? 'es-MX' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = Math.min(1.0, Math.max(0, volume));

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [enabled, language, getVoice, volume]);

  const speakWithName = useCallback((text: string) => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const personalizedText = text.replace(/{name}/g, name);
    speak(personalizedText);
  }, [speak, userName, language]);

  const announceStart = useCallback((exerciseName: string, reps: number, sets: number) => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const message = language === 'es'
      ? `${name}, comenzamos. ${exerciseName}. ${reps} repeticiones, ${sets} series. ¡Vamos!`
      : `${name}, let's begin. ${exerciseName}. ${reps} reps, ${sets} sets. Let's go!`;
    speak(message);
  }, [speak, userName, language]);

  const announceEnd = useCallback(() => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const message = language === 'es'
      ? `¡Excelente trabajo, ${name}! Rutina completada. Descansa.`
      : `Great work, ${name}! Routine complete. Rest up.`;
    speak(message);
  }, [speak, userName, language]);

  const announceRest = useCallback((seconds: number, nextExercise?: string) => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const message = language === 'es'
      ? `Descanso, ${name}. ${seconds} segundos.${nextExercise ? ` Siguiente: ${nextExercise}.` : ''}`
      : `Rest, ${name}. ${seconds} seconds.${nextExercise ? ` Next: ${nextExercise}.` : ''}`;
    speak(message);
  }, [speak, userName, language]);

  const announceExercise = useCallback((exerciseName: string, reps: number) => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const message = language === 'es'
      ? `${name}, ahora: ${exerciseName}. ${reps} repeticiones.`
      : `${name}, now: ${exerciseName}. ${reps} reps.`;
    speak(message);
  }, [speak, userName, language]);

  const announceTimeMilestone = useCallback((minutes: number) => {
    if (!enabled) return;
    
    const milestones = language === 'es' ? timeMilestonesEs : timeMilestonesEn;
    const milestone = milestones[minutes];
    
    if (milestone && !announcedMilestonesRef.current.has(minutes)) {
      announcedMilestonesRef.current.add(minutes);
      speakWithName(milestone);
    }
  }, [enabled, language, speakWithName]);

  const checkTimeMilestone = useCallback((elapsedSeconds: number) => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const milestoneMinutes = [5, 10, 20, 30, 45];
    
    if (milestoneMinutes.includes(minutes)) {
      announceTimeMilestone(minutes);
    }
  }, [announceTimeMilestone]);

  const resetMilestones = useCallback(() => {
    announcedMilestonesRef.current.clear();
  }, []);

  const getRandomMotivationalPhrase = useCallback(() => {
    const phrases = language === 'es' ? motivationalPhrasesEs : motivationalPhrasesEn;
    const phrase = phrases[phraseIndexRef.current % phrases.length];
    phraseIndexRef.current++;
    return phrase;
  }, [language]);

  const startMotivationalLoop = useCallback((intervalSeconds: number = 5) => {
    if (!enabled) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const phrase = getRandomMotivationalPhrase();
      speakWithName(phrase);
    }, intervalSeconds * 1000);
  }, [enabled, getRandomMotivationalPhrase, speakWithName]);

  const stopMotivationalLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopMotivationalLoop();
  }, [stopMotivationalLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return {
    speak,
    speakWithName,
    announceStart,
    announceEnd,
    announceRest,
    announceExercise,
    announceTimeMilestone,
    checkTimeMilestone,
    resetMilestones,
    startMotivationalLoop,
    stopMotivationalLoop,
    stopSpeaking,
  };
};
