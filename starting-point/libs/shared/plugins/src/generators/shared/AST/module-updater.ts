/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ClassDeclaration,
    ObjectLiteralExpression,
    Expression,
    CallExpression,
    ObjectLiteralElementLike,
    SourceFile,
    SyntaxKind,
    ArrayLiteralExpression,
    Project,
} from 'ts-morph';
import { addDefaultImport, addNamedImportStatement, findClassWithDecorator } from './utils';

type ModuleDecoratorProperty = 'providers' | 'imports' | 'declarations';

export class AngularModuleAstUpdater {
    private moduleClass: ClassDeclaration;
    private project = new Project();
    private sourceFile: SourceFile;

    // Literal in NgModule NgModule({..input..})
    private ngModuleInput: ObjectLiteralExpression;

    private get importsProperty(): ObjectLiteralElementLike | undefined {
        return this.ngModuleInput.getProperty('imports');
    }

    private get providersProperty(): ObjectLiteralElementLike | undefined {
        return this.ngModuleInput.getProperty('providers');
    }

    private get declarationsProperty(): ObjectLiteralElementLike | undefined {
        return this.ngModuleInput.getProperty('declarations');
    }

    constructor(sourceFile: SourceFile | string) {
        this.setSourceFile(sourceFile);

        this.moduleClass = this.findModuleClass();
        const ngModuleDecorator = this.moduleClass.getDecorator('NgModule');
        const decoratorArguments = ngModuleDecorator.getArguments() as ObjectLiteralExpression[];

        this.ngModuleInput = decoratorArguments[0];
    }

    getModuleAsText(): string {
        return this.sourceFile.getText();
    }

    addNamedImport(moduleName: string, moduleImportPath: string): this {
        addNamedImportStatement(this.sourceFile, moduleName, moduleImportPath);

        return this;
    }

    addDefaultImport(moduleName: string, moduleImportPath: string): this {
        addDefaultImport(this.sourceFile, moduleName, moduleImportPath);
        return this;
    }

    addExtensionConfigProviderToModule(config: string, useValueProvider?: boolean): this {
        if (!this.providersProperty) {
            if (useValueProvider) {
                this.ngModuleInput.addProperty(`providers: [provideExtensionConfigValues([${config}])]`);
            } else {
                this.ngModuleInput.addProperty(`providers: [provideExtensionConfig(['${config}'])]`);
            }

            return this;
        }

        const array = this.providersProperty.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
        const allProvidedElements = array.getElements();

        const allProvidedCallExpressions = allProvidedElements.filter((elem) => elem.getKind() === SyntaxKind.CallExpression);

        let isProvideFunctionAlreadyProvided = false;
        let isConfigAlreadyProvided = false;
        let provideExtensionConfigCallExpression: Expression | undefined;

        const provideConfigType = useValueProvider ? 'provideExtensionConfigValues' : 'provideExtensionConfig';

        for (const callExpressions of allProvidedCallExpressions) {
            const identifier = callExpressions.getDescendantsOfKind(SyntaxKind.Identifier);
            const functionName = identifier[0].getText();

            if (provideConfigType === functionName) {
                isProvideFunctionAlreadyProvided = true;
                provideExtensionConfigCallExpression = callExpressions;
                const configArray = (callExpressions as CallExpression).getArguments() as ArrayLiteralExpression[];

                isConfigAlreadyProvided = useValueProvider
                    ? configArray[0].getElements().some((element) => {
                          return element.isKind(SyntaxKind.Identifier) && element.getText() === config;
                      })
                    : configArray[0].getElements().some((element) => {
                          return element.isKind(SyntaxKind.StringLiteral) && element.getLiteralValue() === config;
                      });
            }
        }

        if (isProvideFunctionAlreadyProvided) {
            if (!isConfigAlreadyProvided) {
                // We have provideExtensionConfig but without our config
                const provideConfigArguments = provideExtensionConfigCallExpression.getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression);
                if (useValueProvider) {
                    provideConfigArguments.addElement(config);
                } else {
                    provideConfigArguments.addElement(`'${config}'`);
                }
            }
        } else {
            // We do not have provideExtensionConfig() in providers
            if (useValueProvider) {
                array.addElement(`provideExtensionConfigValues([${config}])`);
            } else {
                array.addElement(`provideExtensionConfig(['${config}'])`);
            }
        }

        return this;
    }

    setExtensionComponent(componentName: string, componentId: string): this {
        const moduleClass = this.findModuleClass();

        let constructors = moduleClass.getConstructors();
        if (constructors.length === 0) {
            moduleClass.addConstructor();
            constructors = moduleClass.getConstructors();
        }

        const constructor = constructors[0];
        const parameters = constructor.getParameters();
        let injectedExtensionService = parameters.find((parameter) => {
            const parameterType = parameter.getType();

            // e.g. 'import("/alfresco-apps/node_modules/@alfresco/adf-extensions/lib/services/extension.service").ExtensionService'
            const parameterTypeAsText = parameterType.getText();
            const isExtensionService = /\.ExtensionService$/.test(parameterTypeAsText);
            return isExtensionService;
        });

        if (!injectedExtensionService) {
            // If the extensionService is not injected into class constructor
            injectedExtensionService = constructor.insertParameter(parameters.length, {
                name: 'extensionService',
                type: 'ExtensionService',
            });
        }

        const extensionServiceIdentifier = injectedExtensionService.getFirstChild();
        const extensionServiceName = extensionServiceIdentifier.getText();
        const constructorBlocks = constructor.getChildrenOfKind(SyntaxKind.Block);
        const syntaxList = constructorBlocks[0].getChildrenOfKind(SyntaxKind.SyntaxList);
        const expressionStatements = syntaxList[0].getChildrenOfKind(SyntaxKind.ExpressionStatement);

        const extensionServiceSetComponentsCall = expressionStatements.find((expression) => {
            const callExpression = expression.getFirstChildByKind(SyntaxKind.CallExpression);
            const propertyAccess = callExpression.getFirstChildByKind(SyntaxKind.PropertyAccessExpression);
            const propertyAccessName = propertyAccess.getFirstChildByKind(SyntaxKind.Identifier);
            return extensionServiceName === propertyAccessName.getText();
        });

        if (extensionServiceSetComponentsCall) {
            const objectPassedToMethod = extensionServiceSetComponentsCall.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);

            const allPropertyAssignments = objectPassedToMethod[0].getDescendantsOfKind(SyntaxKind.PropertyAssignment);
            const isComponentIdAlreadyUsed = allPropertyAssignments.some((propertyAssignment) => {
                const prop = propertyAssignment.getFirstDescendantByKind(SyntaxKind.StringLiteral);
                return prop.getText() === `'${componentId}'`;
            });

            if (!isComponentIdAlreadyUsed) {
                objectPassedToMethod[0].addPropertyAssignment({
                    name: `'${componentId}'`,
                    initializer: componentName,
                });
            }
        } else {
            // We are missing setComponents() call in constructor
            constructorBlocks[0].addStatements(`${extensionServiceName}.setComponents({
                '${componentId}': ${componentName}
            })`);
        }

        return this;
    }

    addDeclarationToModule(declarationName: string): this {
        return this.addElementToNgModule('declarations', declarationName);
    }

    addImportToModule(importName: string): this {
        return this.addElementToNgModule('imports', importName);
    }

    hasNgModuleImport(importName: string): boolean {
        return this.hasNgModuleElement('imports', importName);
    }

    addProviderToModule(providerName: string): this {
        return this.addElementToNgModule('providers', providerName);
    }

    getImportedClassNames(): string[] {
        if (!this.importsProperty) {
            return [];
        }

        return this.getObjectLiteralElements(this.importsProperty);
    }

    getDeclarationsClassName(): string[] {
        if (!this.declarationsProperty) {
            return [];
        }

        return this.getObjectLiteralElements(this.declarationsProperty);
    }

    private getObjectLiteralElements(property: ObjectLiteralElementLike): string[] {
        const propertyValue = property.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
        const allImportedElements = propertyValue.getElements();
        return allImportedElements.map((element) => element.getText());
    }

    private addElementToNgModule(propertyName: ModuleDecoratorProperty, elementName: string): this {
        let property: ObjectLiteralElementLike;

        switch (propertyName) {
            case 'declarations': {
                property = this.declarationsProperty;
                break;
            }
            case 'providers': {
                property = this.providersProperty;
                break;
            }
            case 'imports': {
                property = this.importsProperty;
                break;
            }
        }

        // NgModule is missing selected property, e.g. is missing the 'declarations' property
        if (!property) {
            this.ngModuleInput.addProperty(`${propertyName}: [${elementName}]`);

            return this;
        }

        const propertyValue = property.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
        const allImportedElements = propertyValue.getElements();
        const isElementAlreadyAdded = allImportedElements.some((element) => {
            return element.getText() === elementName;
        });

        // e.g. we are missing our element in 'declarations' array
        if (!isElementAlreadyAdded) {
            propertyValue.addElement(elementName);
        }

        return this;
    }

    private hasNgModuleElement(propertyName: ModuleDecoratorProperty, elementName: string): boolean {
        let property: ObjectLiteralElementLike;

        switch (propertyName) {
            case 'declarations': {
                property = this.declarationsProperty;
                break;
            }
            case 'providers': {
                property = this.providersProperty;
                break;
            }
            case 'imports': {
                property = this.importsProperty;
                break;
            }
        }

        if (!property) {
            return false;
        }

        const propertyValue = property.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
        const allImportedElements = propertyValue.getElements();
        return allImportedElements.some((element) => {
            return element.getText() === elementName;
        });
    }

    private findModuleClass(): ClassDeclaration | undefined {
        return findClassWithDecorator(this.sourceFile, 'NgModule');
    }

    private setSourceFile(sourceFile: SourceFile | string): void {
        if (typeof sourceFile === 'string') {
            const moduleSourceFile = this.project.createSourceFile(`module-${Date.now()}.ts`, sourceFile, {
                overwrite: true,
            });

            this.sourceFile = moduleSourceFile;
        } else {
            this.sourceFile = sourceFile;
        }
    }
}
