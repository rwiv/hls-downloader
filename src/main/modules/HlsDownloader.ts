import path from "path";
import fs from "fs-extra";
import axios from "axios";
import constants from "../misc/constants";
import logger from "../misc/logger";
import {WriteStream} from "fs";

export default class HlsDownloader {

  async downloadSync(tgName: string, prefixUrl: string, sfNames: string[]) {
    logger.info("download start!");
    const length = sfNames.length;
    for (let i = 0; i < sfNames.length; i++) {
      const sfName = sfNames[i];
      // directory path
      const dp = path.join(constants.path.download, tgName);
      await fs.ensureDir(dp);

      const sfUrl = prefixUrl + sfName;
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

  async download(tgName: string, prefixUrl: string, sfNames: string[], window: number) {
    logger.info("download start!");
    const length = sfNames.length;
    let startIdx = 0;
    while (true) {
      const nextIdx = await this.downloadParallel(sfNames, startIdx, length, tgName, prefixUrl, window);
      startIdx = nextIdx;
      if (nextIdx === -1) break;
    }
    logger.info("download complete!");
  }

  private async downloadParallel(sfNames: string[], startIdx: number, length: number, tgName: string, prefixUrl: string, window: number) {
    let idx = startIdx;
    const ps: Promise<void>[] = [];
    for (let i = 0; i < window; i++) {
      if (idx === length) {
        return -1;
      }

      const sfName = sfNames[idx];
      const p = this.downloadOne(sfName, idx, length, tgName, prefixUrl);
      ps.push(p);
      idx++;
    }
    await Promise.all(ps);
    return idx;
  }

  private async downloadOne(sfName: string, idx: number, length: number, tgName: string, prefixUrl: string) {
    // directory path
    const dp = path.join(constants.path.download, tgName);
    await fs.ensureDir(dp);

    const sfUrl = prefixUrl + sfName;
    const sfPath = path.join(dp, `${idx}.ts`);
    await fs.ensureFile(sfPath);
    const ws = fs.createWriteStream(sfPath);

    const res = await axios.get(sfUrl, { responseType: "stream" });
    res.data.pipe(ws);
    await this.waitForClose(ws);

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