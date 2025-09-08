/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MoveApi } from '@hylandsoftware/hxcs-js-client';
import { getHxcsJsClientProvider } from '../hxcs-js-client/hxcs-js-client.factory';

export const moveApiProvider = getHxcsJsClientProvider('MoveApi', MoveApi);

export const MOVE_API_TOKEN = moveApiProvider.provide;
