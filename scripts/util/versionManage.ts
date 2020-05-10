const currVersion = process.env.npm_package_version;

function increase(releaseType: string, version: string): string {
  let changeVersion;
  if (version) {
    changeVersion = version;
  } else {
    const versionBits: any[] = currVersion.split('.');
    let majorBit = versionBits[0] * 1;
    let minorBit = versionBits[1] * 1;
    let patchBit = versionBits[2] * 1;
    if (releaseType === 'major') {
      majorBit += 1;
    } else if (releaseType === 'minor') {
      minorBit += 1;
    } else {
      // default type as patch
      patchBit += 1;
    }
    changeVersion = [majorBit, minorBit, patchBit].join('.');
  }
  return changeVersion;
}

export default increase;
