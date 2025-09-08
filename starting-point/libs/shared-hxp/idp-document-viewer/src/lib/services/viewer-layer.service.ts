/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewerLayer, ViewerLayerType } from '../models/viewer-layer';

export type ViewerLayerRegistrationData = Omit<ViewerLayer, 'order'>;

@Injectable()
export class ViewerLayerService implements OnDestroy {
    private readonly layers: ViewerLayer[] = [];

    private readonly layersChangedSubject$ = new Subject<void>();
    readonly layersChanged$ = this.layersChangedSubject$.pipe(map(() => this.getLayers()));

    ngOnDestroy(): void {
        this.layers.splice(0, this.layers.length);
        this.layersChangedSubject$.complete();
    }

    registerLayer(layer: ViewerLayerRegistrationData): void {
        const index = this.layers.findIndex((l) => l.type === layer.type);
        if (index !== -1) {
            throw new Error(`Layer with type ${layer.type} already registered`);
        }
        const order = this.determineLayerOrder(layer.type);
        this.layers.push({ ...layer, order });
        this.layersChangedSubject$.next();
    }

    unregisterLayer(type: ViewerLayerType): void {
        const index = this.layers.findIndex((l) => l.type === type);
        if (index !== -1) {
            this.layers.splice(index, 1);
            this.layersChangedSubject$.next();
        }
    }

    getLayers(): ReadonlyArray<ViewerLayer> {
        const sortedLayers = this.layers.sort((a, b) => a.order - b.order);
        return sortedLayers;
    }

    getLayerByType(type: ViewerLayerType): ViewerLayer | undefined {
        return Object.freeze(this.layers.find((l) => l.type === type));
    }

    private determineLayerOrder(type: ViewerLayerType): number {
        if (type === ViewerLayerType.Image || type === ViewerLayerType.TextOnly) {
            return 1;
        } else {
            const order = this.layers.length + 1;
            return order > 1 ? order : 2;
        }
    }
}
