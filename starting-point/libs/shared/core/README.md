# Shared Core Library

This library is part of our monorepo and is shared among our libraries and applications. It is intended to house global providers, models, and styles. **Please ensure that only appropriate global elements are added to this library to maintain its integrity and purpose.**

## Contents

- **Global Error Log Model**: Used for confirmation dialogs, displaying log history, and saving errors in the store. This is shared across libs, especially in the studio.
- **Global Providers**: Includes app identifiers and window providers.
- **Global Mat-Selectors**: Shared Material selectors used across different libraries.

## Guidelines

### What to Include

- **Global Providers**: Any provider that is used across multiple applications or libraries.
- **Global Models**: Models that are shared and used globally across libraries.
- **Global Styles**: Styles that are used across different libraries to maintain consistency.

### What Not to Include

- **Lib-Specific Logic**: Any logic or functionality that is specific to a single library should be placed in that application's specific library.
- **Component-Specific Styles**: Styles that are only relevant to a particular component or library should not be included here.
- **Non-Global Models**: Models that are only used within a specific library should be placed in that application's library.

## Usage

To use the shared/core library in the application, import the necessary modules or providers as needed:

```typescript
import { ErrorLogGroup } from '@alfresco-dbp/shared-core';
