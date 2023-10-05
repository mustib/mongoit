import path from 'path';
import url from 'url';

function getDirname(metaUrl: string) {
  const __filename = url.fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);

  return __dirname;
}

export default getDirname;
