import { useState, useCallback, useRef, useEffect } from "react";
import { getIntlLocale } from "@/lib/locale-format";
import type { AppLocale } from "@/i18n";

export function useVoiceRecognition(onTranscript: (text: string) => void, locale: AppLocale = "en") {
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const speechLang = getIntlLocale(locale);

    useEffect(() => {
        setIsSupported(
            Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
        );
    }, []);

    const start = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.lang = speechLang;
        r.continuous = true;
        r.interimResults = true;
        r.onstart = () => setIsListening(true);
        r.onerror = () => setIsListening(false);
        r.onend   = () => setIsListening(false);
        r.onresult = (event: any) => {
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
            }
            if (final) onTranscript(final);
        };
        r.start();
        recognitionRef.current = r;
    }, [onTranscript, speechLang]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const toggle = useCallback(() => {
        isListening ? stop() : start();
    }, [isListening, start, stop]);

    return { isListening, isSupported, toggle, start, stop };
}
