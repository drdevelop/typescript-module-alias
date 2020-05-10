import path from 'path';
import logger from './logger';

class PathHost {
  baseUrl: string;
  paths: any;
  fastWayPaths: any;

  constructor({baseUrl, paths}: any) {
    this.baseUrl = baseUrl;
    this.paths = paths;
    this.fastWayPaths = this.transformConfigPaths(baseUrl, paths);
  }

  getHeadReg(oldRegStr: string): RegExp {
    return new RegExp(`^(${oldRegStr})`);
  }

  clearAllMatchMark(str: string): string {
    return str.replace('*', '');
  }

  fast2absoluteWithModules(modulePaths: string[]): string[] {
    return modulePaths.map(modulePath => this.fast2absoluteWithModule(modulePath));
  }

  fast2absoluteWithModule(modulePath: string): string {
    const match: { value?: string; mapPath?: string } = {};
    Object.keys(this.fastWayPaths).forEach(fastPath => {
      if (match.value) return;
      const regStr = this.getHeadReg(fastPath);
      const matchModulePath = new RegExp(regStr).exec(modulePath);
      match.value = matchModulePath && matchModulePath[0];
      if (match.value) {
        match.mapPath = this.clearAllMatchMark(this.fastWayPaths[fastPath][0]);
      }
    })

    if (match.value) {
      const replaceReg = this.getHeadReg(match.value);
      return path.join(match.mapPath, modulePath.replace(replaceReg, ''));
    }
    return modulePath;
  }

  fast2relate(modulePaths: string[]): any[] {
    return modulePaths.map((modulePath: string) => {
      return modulePath;
    })
  }

  transformRequirePath(code: string, outputRelate: string): void {
    const matchRequirePathReg = /require\(["']([\w\-\.\@~\/]+)["']\)/;
    const matchRequirePathRegAll = /require\(["']([\w\-\.\@~\/]+)["']\)/g;
    const allRequires = code.match(matchRequirePathRegAll);
    const matchPathStack: any[] = [];
    allRequires.forEach(requireStr => {
      const matchParts = requireStr.match(matchRequirePathReg);
      // get match path
      // for example: require('@test/b') => @test/b
      const matchPath = matchParts[1];
      matchPathStack.push(matchPath);
    })
    let outputPath: string | string[];
    if (!outputRelate) {
      outputPath = this.fast2absoluteWithModules(matchPathStack);
    } else {
      outputPath = this.fast2relate(matchPathStack);
    }
    matchPathStack.forEach((matchPath, i) => {
      code = code.replace(matchPath, outputPath[i]);
    });
  }

  transformConfigPaths(baseUrl: string, paths: any): any {
    const absolutePaths = {};
    Object.keys(paths).forEach(fastWay => {
      const relatePathValue: any = [];
      paths[fastWay].forEach((relatePath: string) => {
        relatePathValue.push(path.join(baseUrl, relatePath));
      })
      absolutePaths[fastWay] = relatePathValue;
    })
    return absolutePaths;
  }

  /**
   * change module paths for file external modules
   * @param {*} sourceText file source text
   * @param {*} imports import modules array with this file
   * @param {*} outputType the type of output external module path, for example: 'relative' | 'absolute'
   */
  changeModulePaths(fileName: string, sourceText: string, imports: any[], outputType: 'relative' | 'absolute'): string {
    for (let i = 0; i < imports.length; i++) {
      // if imports.length > 1, splice front external module path
      // then need change next external pos and end prop #todo
      const oldPos = imports[i].pos + 1;
      const oldEnd = imports[i].end;
      logger.log('will be replaced text', sourceText.slice(oldPos, oldEnd))
      const absolutePath = this.fast2absoluteWithModule(imports[i].text);
      // if the old import path is relative path, then don't need transform
      if (!path.isAbsolute(absolutePath)) {
        continue;
      }
      let replacePath;
      if (outputType === 'absolute') {
        replacePath = absolutePath;
      } else if (outputType === 'relative') {
        logger.log('[absolutePath]', absolutePath)
        replacePath = this.getRelativeBetween2AbsolutePath(fileName, absolutePath);
      }
      const changeLen = replacePath.length - imports[i].text.length;
      const sourceTextParts = [
        sourceText.slice(0, oldPos),
        `'${replacePath}'`,
        sourceText.slice(oldEnd)
      ];
      sourceText = sourceTextParts.join('');
      this.changeOtherImportsPos(i, changeLen, imports);
    }
    return sourceText;
  }

  getRelativeBetween2AbsolutePath(fileName: string, importPath: string): string {
    const currDir = path.dirname(fileName);
    const strHeap = currDir.split('');
    // computed between fileName and importPath common dir prefix
    let end = 0;
    for (let i = 0; i < strHeap.length; i++) {
      if (importPath[i] === strHeap[i]) {
        end = i;
      } else {
        break;
      }
    }
    const oldMatchDir = currDir.slice(0, end + 1);
    const realMatchDir = oldMatchDir.split('/').slice(0, -1).join('/') + '/';
    end = realMatchDir.length - 1;
    logger.log('matchdir', oldMatchDir, realMatchDir, currDir)
    if (end === currDir.length - 1) {
      // The path to be imported is in the current directory
      return importPath.replace(this.getHeadReg(currDir), '.');
    } else {
      // The path to be imported is out the current directory
      // The path separator of window system is\, need according to different systems to split
      // Mac os is /, window is \
      const replacedMatchPart = fileName.replace(this.getHeadReg(realMatchDir), '');
      // If go out, real layers show be reduced 1
      const goOutLayers = replacedMatchPart.split('/').length - 1;
      let layersStr = '';
      for (let i = 0; i < goOutLayers; i++) {
        layersStr += '../';
      }
      // clear tail separator
      return layersStr + importPath.replace(this.getHeadReg(realMatchDir), '');
    }
  }

  changeOtherImportsPos(index: number, changeLen: number, imports: any[]): void {
    // change from next import part
    for (let i = index + 1; i < imports.length; i++) {
      const oldPos = imports[i].pos;
      const oldEnd = imports[i].end;
      imports[i].pos = oldPos + changeLen;
      imports[i].end = oldEnd + changeLen;
    }
  }

  fast2absoluteWithAst(sourceText: string, sourceFile: any): string {
    const imports = sourceFile.imports;
    if (!imports) return sourceText;
    for (let i = 0; i < imports.length; i++) {
      const importAst = imports[i];
      const replacedPath = this.fast2absoluteWithModule(importAst.text);
      logger.log('replacePath', replacedPath);
      // sourceText = sourceText.splice(importAst.pos, importAst.end, replacedPath);
    }
  }
}

export default PathHost;