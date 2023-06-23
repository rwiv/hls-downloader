import path from "path";

const rootPath = getRootPath();
const downloadPath = path.join(rootPath, "download");
const configPath = path.join(rootPath, "config");

const constants = {
  path: {
    root: rootPath,
    download: downloadPath,
    config: configPath
  }
}

function getRootPath(): string {
  const curPath = path.join(__dirname);
  const projectName = "hls-downloader";
  const matches: any = curPath.match(RegExp(`(.*${projectName}).*`));
  return matches[1];
}

export default constants;