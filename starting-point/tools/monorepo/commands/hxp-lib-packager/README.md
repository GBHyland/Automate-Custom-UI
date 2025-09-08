# HxP Lib Packager

This is a tool that creates a publishable library for HXCS.
Make sure to have the right PAT for GH with packages write access in order to publish the lib

## Testing

```sh
npm run mr hxp-lib-packager --silent -- --build "adf-enterprise-adf-hx-content-services"
```

## Publish

```sh
npm run mr hxp-lib-packager --silent -- --build "adf-enterprise-adf-hx-content-services" --publish true
```
