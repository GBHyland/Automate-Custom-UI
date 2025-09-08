/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
HTMLCanvasElement.prototype.getContext = () => {
    // Return a mock context object
    return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (x, y, w, h) => {
            return {
                data: new Uint8ClampedArray(w * h * 4),
            };
        },
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => {
            return { width: 0 };
        },
        transform: () => {},
        rect: () => {},
        clip: () => {},
    };
};
