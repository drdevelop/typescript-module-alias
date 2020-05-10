import fs from 'fs';

export function writeFile(filePath: string, data: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
