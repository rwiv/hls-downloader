import path from "path";

const rootPath = getRootPath();
const downloadPath = path.join(rootPath, "download");

const constants = {
  path: {
    root: rootPath,
    download: downloadPath
  }
}

function getRootPath(): string {
  const curPath = path.join(__dirname);
  const projectName = "hls-downloader";
  const matches = curPath.match(RegExp(`(.*${projectName}).*`))
  return matches[1];
}

export default constants;