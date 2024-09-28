import { ProgressBar } from 'boot-cell';
import { observable } from 'mobx';
import { createWorker, LoggerMessage } from 'tesseract.js';
import { component, observer } from 'web-cell';

import { CameraView } from '../component/Camera';

@component({ tagName: 'home-page' })
@observer
export class HomePage extends HTMLElement {
    @observable
    accessor currentProgress: LoggerMessage | undefined;

    @observable
    accessor resultText: string | undefined;

    handleRecognize = async ({ detail }: CustomEvent<Blob>) => {
        const worker = await createWorker('chi_sim', 1, {
            logger: message => (this.currentProgress = message)
        });
        const { data } = await worker.recognize(detail);

        this.resultText = data.text.replace(
            /(?<=[\p{Script=Han}])\s+(?=[\p{Script=Han}])/gu,
            ''
        );
        await worker.terminate();
    };

    render() {
        const { progress = 0, status } = this.currentProgress || {};
        const precent = progress * 100;

        return (
            <>
                <CameraView
                    className="vh-100"
                    onCapture={this.handleRecognize}
                />
                <ProgressBar
                    now={precent}
                    label={value => `${value}% ${status}`}
                />
                <p>{this.resultText}</p>
            </>
        );
    }
}
