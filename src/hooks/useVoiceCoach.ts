// PomiABSPro - Voice Coach Hook (Text-to-Speech)
import { useCallback, useRef, useEffect } from 'react';
import { Language } from '@/lib/i18n';

interface VoiceCoachOptions {
  language: Language;
  enabled: boolean;
  userName?: string;
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

export const useVoiceCoach = ({ language, enabled, userName }: VoiceCoachOptions) => {
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phraseIndexRef = useRef(0);

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
    utterance.volume = 1.0;

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [enabled, language, getVoice]);

  const speakWithName = useCallback((text: string) => {
    const name = userName || (language === 'es' ? 'Campeón' : 'Champion');
    const personalizedText = text.replace('{name}', name);
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
    startMotivationalLoop,
    stopMotivationalLoop,
    stopSpeaking,
  };
};
