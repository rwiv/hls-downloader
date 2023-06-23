import path from "path";
import fs from "fs-extra";
import HlsParser from "./modules/HlsParser";
import HlsDownloader from "./modules/HlsDownloader";
import constants from "./misc/constants";
import ChunkFileManager from "./modules/ChunkFileManager";
import {ReqInfo} from "./modules/types";

async function main(outName: string, windowSize: number) {
  const cPath = constants.path.config;
  const m3u8Path = path.join(cPath, "m3u8.txt");
  const prefixUrlPath = path.join(cPath, "url.txt");
  const prefixUrl = await fs.readFile(prefixUrlPath, "utf-8");
  const m3u8 = await fs.readFile(m3u8Path, "utf-8");

  const parser = new HlsParser();
  const downloader = new HlsDownloader();
  const chunkManager = new ChunkFileManager();
  const sfNames = parser.parse(m3u8);
  const tgName = Date.now().toString();
  const info: ReqInfo = { tgName, sfNames, prefixUrl, windowSize };
  await downloader.download(info);

  const tdp = path.join(constants.path.download, tgName);
  await chunkManager.merge(tdp, outName);
  await fs.remove(tdp);
}

main("out.ts", 5);
