import { component, observer, WebCell, WebCellProps } from 'web-cell';
import { stringifyCSS } from 'web-utility';

export interface CameraViewProps extends WebCellProps {
    onCapture?: (event: CustomEvent<Blob>) => any;
}

export interface CameraView extends WebCell<CameraViewProps> {}

@component({ tagName: 'camera-view', mode: 'open' })
@observer
export class CameraView
    extends HTMLElement
    implements WebCell<CameraViewProps>
{
    cssCode = stringifyCSS({
        ':host': { display: 'block' },
        video: { width: '100%', height: '100%' }
    });

    async init(video?: HTMLVideoElement) {
        const { width, height } = getComputedStyle(video);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: parseFloat(width), height: parseFloat(height) }
        });

        video.srcObject = stream;
        video.play();
    }

    handleCapture = async (event: MouseEvent) => {
        const video = event.currentTarget as HTMLVideoElement;

        if (video.paused) return video.play();

        video.pause();

        const { width, height } = getComputedStyle(video);

        const canvas = new OffscreenCanvas(
            parseFloat(width),
            parseFloat(height)
        );
        const context = canvas.getContext('2d');

        context.drawImage(video, 0, 0);

        const blob = await canvas.convertToBlob();

        this.emit('capture', blob);
    };

    render() {
        return (
            <>
                <style>{this.cssCode}</style>

                <video ref={this.init} onClick={this.handleCapture} />
            </>
        );
    }
}
