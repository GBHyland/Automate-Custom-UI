# Hyland Document Viewer

The **Hyland Document Viewer** is an Angular library designed to provide robust document viewing capabilities within Hyland's IDP solutions. This library is used by consumer applications such as `idp-classification-viewer` to display and interact with various document types.

## Features

- View PDF and image documents within your Angular applications.
- Support for zoom, various layout, rotate, and page navigation.
- Support for ocr, tooltip, rubberbanding.
- Integration-ready with Hyland's IDP ecosystem.

## Installation

Simply import it into your consumer app module:

```typescript
import { IdpViewerDocument } from '@hyland/idp-document-viewer';
```

## Usage

In your Angular component template:

```html
<idp-document-viewer 
    [datasource]="datasource"
    [configuration]="configuration"
    [keyboardEvent]="(keyboardEvent$ | async)"
    (viewerEvent)="onViewerEvent($event)"></idp-document-viewer>
```

For a complete usage example, refer to the `idp-classification-viewer` app, which demonstrates how to integrate and configure the document viewer.

## Running Unit Tests

To execute the unit tests for this library:

```bash
nx test idp-document-viewer --code-coverage
```

## Development

- Make changes in the library source under `libs/shared-hxp/idp-document-viewer/`.
- Export new components or services in `index.ts`.
- Update the README with any new features or usage instructions.

## Related Projects

- `idp-classification-viewer`: Example consumer app using this library.

