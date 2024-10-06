import { Button, ProgressBar } from 'boot-cell';
import { observable } from 'mobx';
import { component, observer } from 'web-cell';
import { CustomElement } from 'web-utility';

import { CameraView } from '../component/Camera';
import { OCRModel } from '../model/OCR';
import { TTSModel, TTSState } from '../model/TTS';

@component({ tagName: 'home-page' })
@observer
export class HomePage extends HTMLElement implements CustomElement {
    storeOCR = new OCRModel();
    storeTTS = new TTSModel();

    @observable
    accessor cameraOpened = false;

    connectedCallback() {
        this.classList.add('d-flex', 'flex-column', 'gap-3', 'py-3');
    }

    handleRecognition = ({ detail }: CustomEvent<Blob>) => {
        this.cameraOpened = false;

        this.storeOCR.recognize(detail);
    };

    toggleSpeaking = () => {
        const { storeTTS } = this;

        if (storeTTS.state !== TTSState.Clear) return storeTTS.toggle();

        const text = TTSModel.getReadableText(this.querySelector('article'));

        storeTTS.speak(text);
    };

    render() {
        const { storeOCR, storeTTS, cameraOpened } = this;
        const { currentPercent, resultText } = storeOCR,
            speaking = storeTTS.state === TTSState.Speaking;

        return (
            <>
                <header className="d-flex justify-content-around">
                    <Button
                        variant="danger"
                        size="lg"
                        onClick={() => (this.cameraOpened = true)}
                    >
                        📷
                    </Button>
                    <Button
                        variant={speaking ? 'warning' : 'info'}
                        size="lg"
                        onClick={this.toggleSpeaking}
                    >
                        {speaking ? '🔇' : '📢'}
                    </Button>
                </header>

                {cameraOpened && (
                    <div className="position-fixed start-0 top-0 w-100 h-100 bg-black">
                        <CameraView
                            className="h-100"
                            onCapture={this.handleRecognition}
                        />
                    </div>
                )}
                <ProgressBar
                    now={currentPercent}
                    label={value =>
                        `${value?.toFixed(2)}% ${storeOCR.currentProgress?.status}`
                    }
                />
                <article>{resultText}</article>
            </>
        );
    }
}
