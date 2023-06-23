import path from "path";
import fs from "fs-extra";
import axios from "axios";
import constants from "../misc/constants";
import logger from "../misc/logger";
import {WriteStream} from "fs";
import {ReqInfo} from "./types";

export default class HlsDownloader {

  async downloadSync(info: ReqInfo) {
    logger.info("download start!");

    const sfNames = info.sfNames;
    const length = sfNames.length;

    for (let i = 0; i < sfNames.length; i++) {
      const sfName = sfNames[i];
      // directory path
      const dp = path.join(constants.path.download, info.tgName);
      await fs.ensureDir(dp);

      const sfUrl = info.prefixUrl + sfName;
      const sfPath = path.join(dp, `${i}.ts`);
      await fs.ensureFile(sfPath);
      const ws = fs.createWriteStream(sfPath);

      const res = await axios.get(sfUrl, { responseType: "stream" });
      res.data.pipe(ws);
      await this.waitForClose(ws);
      logger.info(`downloaded: ${i + 1}/${length}`)
    }
    logger.info("download complete!");
  }

  async download(info: ReqInfo) {
    logger.info("download start!");
    let startIdx = 0;
    while (true) {
      const nextIdx = await this.downloadParallel(info, startIdx);
      startIdx = nextIdx;
      if (nextIdx === -1) break;
    }
    logger.info("download complete!");
  }

  private async downloadParallel(info: ReqInfo, startIdx: number) {
    const length = info.sfNames.length;
    let idx = startIdx;
    const ps: Promise<void>[] = [];
    for (let i = 0; i < info.windowSize; i++) {
      if (idx === length) {
        return -1;
      }

      const p = this.downloadOne(info, idx);
      ps.push(p);
      idx++;
    }
    await Promise.all(ps);
    return idx;
  }

  private async downloadOne(info: ReqInfo, idx: number) {
    const sfName = info.sfNames[idx];
    // directory path
    const dp = path.join(constants.path.download, info.tgName);
    await fs.ensureDir(dp);

    const sfUrl = info.prefixUrl + sfName;
    const sfPath = path.join(dp, `${idx}.ts`);
    await fs.ensureFile(sfPath);
    const ws = fs.createWriteStream(sfPath);

    const res = await axios.get(sfUrl, { responseType: "stream" });
    res.data.pipe(ws);
    await this.waitForClose(ws);

    const length = info.sfNames.length;
    logger.info(`downloaded: ${idx + 1}/${length}`)
  }

  private waitForClose(rs: WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
      rs.on("close", () => resolve());
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private getSegmentFilename(fullname: string): string {
    const match: any = fullname.match(/(.*\/)?(.*)/);
    return match[2];
  }
}