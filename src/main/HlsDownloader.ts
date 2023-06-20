import path from "path";
import fs from "fs-extra";
import axios from "axios";
import constants from "./constants";
import {ReadStream} from "fs";

export default class HlsDownloader {

  async download(tgName: string, prefixUrl: string, sfNames: string[]) {
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
    }
  }

  private getSegmentFilename(fullname: string): string {
    const match = fullname.match(/(.*\/)?(.*)/);
    return match[2];
  }

  /**
   *
   * @param tdp target directory path
   * @param rn result file name
   */
  async merge(tdp: string, rn: string) {
    const files = await fs.readdir(tdp)
    const tgs = files
      .filter(fn => fn !== rn)
      .sort((a, b) => {
        const am = a.match(/(.*)\..*/);
        const bm = b.match(/(.*)\..*/);
        return parseInt(am[1]) - parseInt(bm[1]);
      });

    for (const file of tgs) {
      const ws = fs.createWriteStream(path.join(constants.path.download, rn), { flags: "a" });
      const rs = fs.createReadStream(path.join(tdp, file));
      rs.pipe(ws);
      await this.waitForClose(rs);
      ws.close();
    }
  }

  private waitForClose(rs: ReadStream) {
    return new Promise((resolve, reject) => {
      rs.on("close", () => resolve());
    });
  }
}