/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getHxcsJsClientProvider } from '../hxcs-js-client/hxcs-js-client.factory';
import { RenditionsApi } from '@hylandsoftware/hxcs-js-client';

export const renditionsApiProvider = getHxcsJsClientProvider('RenditionsApi', RenditionsApi);

export const RENDITIONS_API_TOKEN = renditionsApiProvider.provide;
