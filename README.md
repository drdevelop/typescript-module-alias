# typescript-module-alias

This is a library that can automatically find and execute corresponding modules according to alias path alias in tsconfig.json

## Install

install with npm:
```
npm install --save-dev typescript-module-alias
```

install with yarn:
```
yarn add typescript-module-alias -dev
```

## Quickstart

### on command line
```
npx typescript-module-alias ./test/a.ts
```

### package.json scripts
#### development
```
  "scripts": {
    "dev": "typescript-module-alias ./test/a.ts"
  }
```

#### production
```
  "scripts": {
    "build": "typescript-module-alias-build ./test"
  }
```
##### set dist dir
> default the dist dir is 'dist'
```
  "scripts": {
    "build": "typescript-module-alias-build ./test --out-dir release"
  }
```
Finally, that will build to "release" dir

## Example
- tsconfig.json
```json
{
  "compileOnSave": true,
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "lib": [
      "es5",
      "es2015",
      "es2017"
    ],
    "baseUrl": "./",
    "paths": {
      "@test/*": ["./test/*"]
    }
  }
}
```
- module test/a.ts
```ts
  import b from '@test/b';
  console.log('module a run success !!!', b);
```

- module test/b.ts
```ts
  console.log('module b run success !!!');
  export default 1;
```

## Advanced use

### Integration with nodemon
> we can use the nodemon exec command to run our old lib script
```
  "scripts": {
    "dev": "nodemon --exec typescript-module-alias ./src/a/index.ts"
  },
```
