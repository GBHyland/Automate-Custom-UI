/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NamedImports, SourceFile, ClassDeclaration } from 'ts-morph';

export const addDefaultImport = (sourceFile: SourceFile, importName: string, importSourcePath: string): SourceFile => {
    const importSourceDeclaration = sourceFile.getImportDeclaration((i) => i.getModuleSpecifierValue() === importSourcePath);

    if (importSourceDeclaration) {
        // We are already importing something from the source path
        const alreadyImportedDefaultValue = importSourceDeclaration.getDefaultImport();

        if (alreadyImportedDefaultValue.getText() === importName) {
            // We already importing needed value
            return sourceFile;
        }

        importSourceDeclaration.setDefaultImport(importName);
        return sourceFile;
    }

    sourceFile.addImportDeclaration({
        defaultImport: importName,
        moduleSpecifier: importSourcePath,
    });

    return sourceFile;
};

export const addNamedImportStatement = (sourceFile: SourceFile, namedImport: string, importSourcePath: string): SourceFile => {
    const moduleImports = sourceFile.getImportDeclarations();

    const importSourceDeclaration = moduleImports.find((moduleImport) => {
        const currentImportSource = moduleImport.getModuleSpecifierValue();
        return currentImportSource === importSourcePath;
    });

    if (importSourceDeclaration) {
        // We are already importing something from the source path
        const importsClause = importSourceDeclaration.getImportClause();
        const namedBindings = importsClause.getNamedBindings() as NamedImports;
        const namedBindingsElements = namedBindings.getElements();

        const hasProvideExtensionConfigAlreadyImported = namedBindingsElements.some((binding) => binding.getName() === namedImport);

        if (!hasProvideExtensionConfigAlreadyImported) {
            importSourceDeclaration.addNamedImport(namedImport);
        }
    } else {
        sourceFile.insertStatements(sourceFile.getImportDeclarations().length, `import { ${namedImport} } from '${importSourcePath}'`);
    }

    return sourceFile;
};

export const findClassWithDecorator = (sourceFile: SourceFile, decoratorName: string): ClassDeclaration | undefined => {
    const classes = sourceFile.getClasses();

    const moduleClass = classes.find((classInModule) => {
        const decorator = classInModule.getDecorator(decoratorName);
        return !!decorator;
    });

    return moduleClass;
};
