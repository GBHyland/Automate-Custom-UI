/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

interface Action {
    do: () => void;
    undo: () => void;
}

export abstract class ActionHistoryService {
    protected readonly past = new Array<Action>();
    protected readonly future = new Array<Action>();

    protected abstract push(action: Action): void;

    do(action: Action) {
        action.do();
        this.push(action);
    }

    canUndo() {
        return this.past.length > 0;
    }
    undo() {
        const action = this.past.pop();
        if (action) {
            action.undo();
            this.future.push(action);
        }
    }

    canRedo() {
        return this.future.length > 0;
    }
    redo() {
        const action = this.future.pop();
        if (action) {
            action.do();
            this.past.push(action);
        }
    }
}

export class ActionBranchingHistoryService extends ActionHistoryService {
    protected override push(action: Action) {
        this.past.push(action);
        this.future.length = 0;
    }
}

/**
 * Stores history as a linear list of actions where undo itself is part of the history.
 */
export class ActionLinearHistoryService extends ActionHistoryService {
    protected override push(action: Action) {
        for (let i = this.future.length - 1; i >= 0; i--) {
            this.past.push(this.future[i]);
        }
        for (const futureAction of this.future) {
            this.past.push({
                ...futureAction,
                do: futureAction.undo,
                undo: futureAction.do,
            });
        }
        this.past.push(action);
        this.future.length = 0;
    }
}
