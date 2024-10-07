import { observable } from 'mobx';
import { getVisibleText, sleep } from 'web-utility';

export enum TTSState {
    Clear,
    Speaking,
    Pause
}

export class TTSModel {
    @observable
    accessor state = TTSState.Clear;

    constructor() {
        globalThis.addEventListener('unload', this.clear);
    }

    clear = () => {
        this.state = TTSState.Clear;
        speechSynthesis.cancel();
    };

    static getVoices() {
        const voices = speechSynthesis.getVoices();

        return voices[0]
            ? Promise.resolve(voices)
            : new Promise<SpeechSynthesisVoice[]>(resolve => {
                  sleep(1).then(() => resolve([]));

                  speechSynthesis.onvoiceschanged = () =>
                      resolve(speechSynthesis.getVoices());
              });
    }

    async speak(text: string) {
        const content = new SpeechSynthesisUtterance(text),
            voices = await TTSModel.getVoices();

        content.voice =
            voices.find(
                ({ localService, lang }) =>
                    localService && lang === navigator.language
            ) || voices.find(({ default: backup }) => backup);

        const result = new Promise((resolve, reject) => {
            content.onend = resolve;
            content.onerror = reject;
        });
        speechSynthesis.speak(content);

        this.state = TTSState.Speaking;

        try {
            await result;
        } finally {
            this.clear();
        }
    }

    toggle() {
        if (this.state === TTSState.Speaking) {
            speechSynthesis.pause();

            this.state = TTSState.Pause;
        } else {
            speechSynthesis.resume();

            this.state = TTSState.Speaking;
        }
    }

    static *walk(range: Range) {
        const walker = document.createNodeIterator(
            range.commonAncestorContainer
        );
        let current: Node;

        while ((current = walker.nextNode())) {
            if (range.intersectsNode(current)) yield current;

            if (current === range.endContainer) break;
        }
    }

    static getSelectedText(box?: Element) {
        const range = getSelection()?.getRangeAt(0);

        if (!range?.toString() || !box?.contains(range.commonAncestorContainer))
            throw new RangeError('No text selected');

        return [...this.walk(range)]
            .filter(({ nodeType, parentNode }) => {
                if (nodeType !== 3) return;

                const { width, height } = (
                    parentNode as Element
                ).getBoundingClientRect();

                return width && height;
            })
            .map(({ nodeValue }, index, { length }) =>
                nodeValue.slice(
                    index === 0 ? range.startOffset : 0,
                    index === length - 1 ? range.endOffset : Infinity
                )
            )
            .filter(text => text.trim())
            .join('')
            .trim();
    }

    static getReadableText(box?: Element) {
        try {
            return this.getSelectedText(box);
        } catch {
            return getVisibleText(box);
        }
    }
}
