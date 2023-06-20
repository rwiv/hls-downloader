import {it,jest} from "@jest/globals";
import fs from "fs-extra";
import path from "path";
import HlsParser from "../main/HlsParser";
import HlsDownloader from "../main/HlsDownloader";
import constants from "../main/constants";

jest.setTimeout(10000000);

it("test", async () => {
  const m3u8Path = path.join(__dirname, "assets", "test.m3u8");
  const prefixUrlPath = path.join(__dirname, "assets", "prefix_url.txt");
  const prefixUrlStr = await fs.readFile(prefixUrlPath, "utf-8");
  const m3u8Str = await fs.readFile(m3u8Path, "utf-8");

  const parser = new HlsParser();
  const downloader = new HlsDownloader();
  const sfNames = parser.parse(m3u8Str);
  const tgName = "test"
  await downloader.download(tgName, prefixUrlStr, sfNames);

  const tdp = path.join(constants.path.download, tgName);
  const outFn = "result.ts"
  await downloader.merge(tdp, outFn);
  await fs.remove(tdp);
});
