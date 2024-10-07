import { Button, ProgressBar, SpinnerBox } from 'boot-cell';
import { observable } from 'mobx';
import { SpeechSynthesisModel, SpeechSynthesisState } from 'mobx-i18n';
import { component, observer } from 'web-cell';

import { CameraView } from '../component/Camera';
import { OCRModel } from '../model/OCR';

@component({ tagName: 'home-page' })
@observer
export class HomePage extends HTMLElement {
    storeOCR = new OCRModel();
    storeTTS = new SpeechSynthesisModel();

    @observable
    accessor cameraOpened = false;

    handleRecognition = ({ detail }: CustomEvent<Blob>) => {
        this.cameraOpened = false;

        this.storeOCR.recognize(detail);
    };

    toggleSpeaking = () => {
        const { storeTTS } = this;

        if (storeTTS.state !== SpeechSynthesisState.Clear)
            return storeTTS.toggle();

        const text = SpeechSynthesisModel.getReadableText(
            this.querySelector('article')
        );
        storeTTS.speak(text);
    };

    render() {
        const { storeOCR, storeTTS, cameraOpened } = this;
        const { uploading, currentPercent, resultText } = storeOCR;
        const recognizing = uploading > 0,
            speaking = storeTTS.state === SpeechSynthesisState.Speaking;

        return (
            <SpinnerBox
                className="d-flex flex-column gap-3 py-3"
                cover={recognizing}
            >
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
            </SpinnerBox>
        );
    }
}
