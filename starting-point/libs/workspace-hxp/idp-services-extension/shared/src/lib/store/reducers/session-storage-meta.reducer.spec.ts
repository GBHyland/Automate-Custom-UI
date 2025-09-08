/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionReducer } from '@ngrx/store';
import { SessionState } from '../states/session.state';

describe('Session Storage Meta Reducer', () => {
    let mockReducer: jest.MockedFunction<ActionReducer<SessionState>>;
    let mockSessionStorage: {
        getItem: jest.Mock;
        setItem: jest.Mock;
        clear: jest.Mock;
    };

    const initialState: SessionState = {
        isAutoNextTaskChecked: false,
    };

    const updatedState: SessionState = {
        isAutoNextTaskChecked: true,
    };

    const mockAction = { type: 'TEST_ACTION' };

    beforeEach(() => {
        jest.resetModules();

        mockReducer = jest.fn();

        mockSessionStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn(),
        };
        Object.defineProperty(window, 'sessionStorage', {
            value: mockSessionStorage,
            writable: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('first call (loading from session)', () => {
        let consoleWarnSpy: jest.SpyInstance;

        beforeAll(() => {
            consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        });

        afterAll(() => {
            consoleWarnSpy.mockRestore();
        });

        it('should load state from sessionStorage when available and valid', async () => {
            const savedState = { isAutoNextTaskChecked: true };
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedState));
            mockReducer.mockReturnValue(savedState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const result = metaReducer(initialState, mockAction);

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('idpSessionState');
            expect(mockReducer).toHaveBeenCalledWith(savedState, mockAction);
            expect(result).toEqual(savedState);
        });

        it('should continue with normal flow when sessionStorage is empty', async () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            mockReducer.mockReturnValue(updatedState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const result = metaReducer(initialState, mockAction);

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('idpSessionState');
            expect(mockReducer).toHaveBeenCalledWith(initialState, mockAction);
            expect(result).toEqual(updatedState);
        });

        it('should handle invalid JSON in sessionStorage gracefully', async () => {
            mockSessionStorage.getItem.mockReturnValue('invalid-json');
            mockReducer.mockReturnValue(updatedState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const result = metaReducer(initialState, mockAction);

            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('idpSessionState');
            expect(mockReducer).toHaveBeenCalledWith(initialState, mockAction);
            expect(result).toEqual(updatedState);
        });
    });

    describe('subsequent calls (after session loaded)', () => {
        it('should not check sessionStorage on subsequent calls', async () => {
            mockReducer.mockReturnValue(updatedState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            metaReducer(initialState, mockAction);
            expect(mockSessionStorage.getItem).toHaveBeenCalledTimes(1);

            metaReducer(initialState, mockAction);
            expect(mockSessionStorage.getItem).toHaveBeenCalledTimes(1);
        });

        it('should save to sessionStorage when state changes', async () => {
            mockReducer.mockReturnValue(updatedState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const result = metaReducer(initialState, mockAction);

            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idpSessionState', JSON.stringify(updatedState));
            expect(result).toEqual(updatedState);
        });

        it('should not save to sessionStorage when state does not change', async () => {
            mockReducer.mockReturnValue(initialState);

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const result = metaReducer(initialState, mockAction);

            expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
            expect(result).toEqual(initialState);
        });
    });

    describe('complete flow scenarios', () => {
        it('should handle complete flow: load from session, then update and save', async () => {
            const savedState = { isAutoNextTaskChecked: false };
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            mockReducer.mockReturnValueOnce(savedState);
            const firstResult = metaReducer(initialState, mockAction);
            expect(firstResult).toEqual(savedState);
            expect(mockSessionStorage.getItem).toHaveBeenCalledTimes(1);

            mockReducer.mockReturnValueOnce(updatedState);
            const secondResult = metaReducer(savedState, { type: 'UPDATE_ACTION' });
            expect(secondResult).toEqual(updatedState);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idpSessionState', JSON.stringify(updatedState));
        });

        it('should handle multiple state changes and save each one', async () => {
            const { sessionStorageMetaReducer } = await import('./session-storage-meta.reducer');
            const metaReducer = sessionStorageMetaReducer(mockReducer);

            const state1 = { isAutoNextTaskChecked: true };
            const state2 = { isAutoNextTaskChecked: false };

            mockReducer.mockReturnValueOnce(state1);
            metaReducer(initialState, mockAction);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idpSessionState', JSON.stringify(state1));

            mockReducer.mockReturnValueOnce(state2);
            metaReducer(state1, mockAction);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('idpSessionState', JSON.stringify(state2));

            expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2);
        });
    });
});
