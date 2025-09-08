/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const GLOBAL_APPS = `
  query GlobalApps {
    currentUser {
      id
      accountApps {
        id
        launchUrl
        appKey
        provisioningStatus
        app {
          id
          localizedName
          appType
        }
      }

      subscribedApps {
        id
        launchUrl
        appKey
        provisioningStatus
        environment {
          id
          name
        }
        app {
          id
          localizedName
          appType
        }
      }
      platformHomeUrl
    }
  }
`;
