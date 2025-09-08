This folder is used to store all assets that are going to be used in the <%= name %> plugin. The assets are going to be copied to the dist folder when the application is built.

The configuration for assets is located in the `project.json` file of the application:
```
{
    "input": "libs/plugins/<%= name %>/assets",
    "output": "assets/<%= name %>",
    "glob": "**/*"
}
```

In order to use an asset, you need to add it to this folder and reference it by path `assets/<%= name %>/<asset-name>`. For example, an image 'example-image.png' should be referenced as `assets/<%= name %>/example-image.png`.

You can also create your own subfolders to organize your assets, but you need to remember to reference them correctly in the path.
