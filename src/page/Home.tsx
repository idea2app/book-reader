import { observable } from 'mobx';
import { createWorker, RecognizeResult } from 'tesseract.js';
import { component, observer } from 'web-cell';

import { CameraView } from '../component/Camera';

@component({ tagName: 'home-page' })
@observer
export class HomePage extends HTMLElement {
    @observable
    accessor result: RecognizeResult | undefined;

    handleRecognize = async ({ detail }: CustomEvent<Blob>) => {
        const worker = await createWorker('chi_tra', 1, {
            logger: console.log
        });
        this.result = await worker.recognize(detail);

        await worker.terminate();
    };

    render() {
        return (
            <>
                <CameraView
                    className="vh-100"
                    onCapture={this.handleRecognize}
                />
                <pre>{JSON.stringify(this.result, null, 4)}</pre>
            </>
        );
    }
}
