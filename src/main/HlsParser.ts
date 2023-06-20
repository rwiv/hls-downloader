export default class HlsParser {

  parse(m3u8RawString: string): string[] {
    const chunks = m3u8RawString.split(/\r?\n/);

    // #EXTINF's indices
    const infIndices: number[] = [];
    chunks.forEach((v, i , a) => {
      if (v.startsWith("#EXTINF")) infIndices.push(i);
    });

    // segment file names
    return infIndices.map(idx => chunks[idx + 1]);
  }
}