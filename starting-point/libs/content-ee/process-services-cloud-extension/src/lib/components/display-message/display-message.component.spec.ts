/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayMessageComponent } from './display-message.component';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { By, Title } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('DisplayMessageComponent', () => {
    let fixture: ComponentFixture<DisplayMessageComponent>;
    let debugEl: DebugElement;
    let titleServiceSpy: jasmine.Spy;
    const paramMapSubject$ = new Subject();
    const paramMap$ = paramMapSubject$.asObservable();

    const cssSelector = {
        container: '.apa-display-message__container',
        content: '.apa-display-message__content',
    };

    const richText = {
        time: 1_658_154_611_110,
        blocks: [
            {
                id: '1',
                type: 'header',
                data: {
                    text: 'Editor.js',
                    level: 1,
                },
                tunes: {
                    anyTuneName: {
                        alignment: 'center',
                    },
                },
            },
            {
                id: '2',
                type: 'paragraph',
                data: {
                    text: 'Display some <font color="#ff1300">formatted</font> <mark class="cdx-marker">text</mark>',
                },
            },
            {
                id: '3',
                type: 'paragraph',
                data: {
                    text: 'Other text',
                },
                tunes: {
                    anyTuneName: {
                        alignment: 'left',
                    },
                },
            },
        ],
        version: 1,
    };

    const expectedHtml =
        // eslint-disable-next-line max-len
        '<h1 class="ce-tune-alignment--center">Editor.js</h1><p>Display some <font color="#ff1300">formatted</font> <mark class="cdx-marker">text</mark></p><p class="ce-tune-alignment--left">Other text</p>';

    async function createMessage(message: string | any, title?: string): Promise<void> {
        const messageString = title
            ? JSON.stringify({
                  message,
                  title,
              })
            : message;

        window.history.pushState({ message: messageString }, '', '');
        paramMapSubject$.next({ message: messageString });

        fixture.detectChanges();
        await fixture.whenStable();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DisplayMessageComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { params: of({}), snapshot: { url: '' }, paramMap: paramMap$ },
                },
            ],
        }).compileComponents();
        window.history.replaceState({}, '', '');
        fixture = TestBed.createComponent(DisplayMessageComponent);
        debugEl = fixture.debugElement;
        titleServiceSpy = spyOn(TestBed.inject(Title), 'setTitle');
        fixture.detectChanges();
    });

    it('should not display the message if no message is set', () => {
        expect(debugEl.query(By.css(cssSelector.container))).toBeNull();
        expect(debugEl.query(By.css(cssSelector.content))).toBeNull();
    });

    it('should not display the message if the received message can not be parsed', async () => {
        await createMessage('invalid message');

        expect(debugEl.query(By.css(cssSelector.container))).toBeNull();
        expect(debugEl.query(By.css(cssSelector.content))).toBeNull();
    });

    it('should not display the message if the received message is not a valid rich text', async () => {
        await createMessage(JSON.stringify({ blocks: [{}] }));

        expect(debugEl.query(By.css(cssSelector.container))).toBeNull();
        expect(debugEl.query(By.css(cssSelector.content))).toBeNull();
    });

    it('should display the message but not change the title when title is not present', async () => {
        await createMessage(JSON.stringify(richText));

        expect(debugEl.query(By.css(cssSelector.container))).not.toBeNull();
        expect(debugEl.query(By.css(cssSelector.content))).not.toBeNull();
        expect(debugEl.query(By.css(cssSelector.content)).nativeElement.innerHTML.trim()).toEqual(expectedHtml);
        expect(titleServiceSpy).not.toHaveBeenCalled();
    });

    it('should display the message and change the title when title is present', async () => {
        await createMessage(richText, 'Test title');

        expect(debugEl.query(By.css(cssSelector.container))).not.toBeNull();
        expect(debugEl.query(By.css(cssSelector.content))).not.toBeNull();
        expect(debugEl.query(By.css(cssSelector.content)).nativeElement.innerHTML.trim()).toEqual(expectedHtml);
        expect(titleServiceSpy).toHaveBeenCalledWith('Test title');
    });
});
