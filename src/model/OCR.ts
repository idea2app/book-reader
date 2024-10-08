import { computed, observable } from 'mobx';
import { BaseModel, toggle } from 'mobx-restful';
import { createWorker, ImageLike, LoggerMessage } from 'tesseract.js';

export class OCRModel extends BaseModel {
    constructor(public language = 'chi_sim') {
        super();
    }

    @observable
    accessor currentProgress: LoggerMessage | undefined;

    @computed
    get currentPercent() {
        return (this.currentProgress?.progress || 0) * 100;
    }

    @observable
    accessor resultText: string | undefined;

    @toggle('uploading')
    async recognize(image: ImageLike) {
        const worker = await createWorker(this.language, 1, {
            logger: message => (this.currentProgress = message)
        });
        const { data } = await worker.recognize(image);

        await worker.terminate();

        const text = data.text.replace(
            /(?<=[\p{Script=Han}])\s+(?=[\p{Script=Han}])/gu,
            ''
        );
        return (this.resultText = text);
    }
}
