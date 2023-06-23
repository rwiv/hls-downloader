import path from "path";
import fs from "fs-extra";
import {ReadStream} from "fs";
import constants from "../misc/constants";
import logger from "../misc/logger";

export default class ChunkFileManager {

  /**
   *
   * @param tdp target directory path
   * @param rn result file name
   */
  async merge(tdp: string, rn: string) {
    logger.info("merge start!");
    const files = await fs.readdir(tdp)
    const tgs = files
      .filter(fn => fn !== rn)
      .sort((a, b) => {
        const am: any = a.match(/(.*)\..*/);
        const bm: any = b.match(/(.*)\..*/);
        return parseInt(am[1]) - parseInt(bm[1]);
      });

    for (const file of tgs) {
      const ws = fs.createWriteStream(path.join(constants.path.download, rn), { flags: "a" });
      const rs = fs.createReadStream(path.join(tdp, file));
      rs.pipe(ws);
      await this.waitForClose(rs);
      ws.close();
    }
    logger.info("merge complete!");
    logger.info(`output file name: ${rn}`);
  }

  private waitForClose(rs: ReadStream): Promise<void> {
    return new Promise((resolve, reject) => {
      rs.on("close", () => resolve());
    });
  }
}