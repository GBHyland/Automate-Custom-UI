/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ViewerLayerService } from './viewer-layer.service';
import { ViewerLayerType } from '../models/viewer-layer';

describe('ViewerLayerService', () => {
    let service: ViewerLayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new ViewerLayerService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register a layer', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        expect(service.getLayers().length).toBe(1);
        expect(service.getLayers()[0].type).toBe(ViewerLayerType.TextSuperImposed);
        expect(service.getLayers()[0].order).toBe(2);
    });

    it('should emit layer info when a layer is registered', (done) => {
        service.layersChanged$.subscribe((layers) => {
            expect(layers.length).toBe(1);
            expect(layers[0].type).toBe(ViewerLayerType.TextSuperImposed);
            expect(layers[0].order).toBe(2);
            done();
        });

        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
    });

    it('should throw an error when trying to register a layer with the same type', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        expect(() => {
            service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        }).toThrowError('Layer with type TextSuperImposed already registered');
    });

    it('image layer should have order 1', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.registerLayer({ type: ViewerLayerType.Image });
        expect(service.getLayerByType(ViewerLayerType.Image)?.order).toBe(1);
    });

    it('text only layer should have order 1', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.registerLayer({ type: ViewerLayerType.TextOnly });
        expect(service.getLayerByType(ViewerLayerType.TextOnly)?.order).toBe(1);
    });

    it('should emit layer info when a layer is unregistered', (done) => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.layersChanged$.subscribe((layers) => {
            expect(layers.length).toBe(0);
            done();
        });

        service.unregisterLayer(ViewerLayerType.TextSuperImposed);
    });

    it('should unregister a layer', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.unregisterLayer(ViewerLayerType.TextSuperImposed);
        expect(service.getLayers().length).toBe(0);
    });

    it('should get a layer by type', () => {
        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.registerLayer({ type: ViewerLayerType.Image });
        const layer = service.getLayerByType(ViewerLayerType.TextSuperImposed);
        expect(layer).toBeTruthy();
        expect(layer?.type).toBe(ViewerLayerType.TextSuperImposed);
    });

    it('should remove all layers on destroy', (done) => {
        service.layersChanged$.subscribe({
            complete: () => {
                expect(service.getLayers().length).toBe(0);
                done();
            },
        });

        service.registerLayer({ type: ViewerLayerType.TextSuperImposed });
        service.ngOnDestroy();
        expect(service.getLayers().length).toBe(0);
    });
});
