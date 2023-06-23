import {it,jest} from "@jest/globals";
import fs from "fs-extra";
import path from "path";
import HlsParser from "../main/modules/HlsParser";
import HlsDownloader from "../main/modules/HlsDownloader";
import constants from "../main/misc/constants";
import ChunkFileManager from "../main/modules/ChunkFileManager";
import {ReqInfo} from "../main/modules/types";

jest.setTimeout(10000000);

it("test", async () => {
  const m3u8Path = path.join(__dirname, "assets", "m3u8.txt");
  const prefixUrlPath = path.join(__dirname, "assets", "url.txt");
  const prefixUrl = await fs.readFile(prefixUrlPath, "utf-8");
  const m3u8 = await fs.readFile(m3u8Path, "utf-8");

  const parser = new HlsParser();
  const downloader = new HlsDownloader();
  const chunkManager = new ChunkFileManager();
  const sfNames = parser.parse(m3u8);
  const tgName = "test"
  const info: ReqInfo = { tgName, sfNames, prefixUrl, windowSize: 5 };
  await downloader.download(info);

  const tdp = path.join(constants.path.download, tgName);
  const outFn = "result.ts"
  await chunkManager.merge(tdp, outFn);
  await fs.remove(tdp);
});
