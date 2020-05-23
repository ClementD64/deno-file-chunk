/** Read a chunk of file
 * 
 *     // read only byte 20 to 30
 *     const file = Chunk.openSync("/path/to/file", 20, 30);
 *     const data = Deno.readAllSync(file);
 *     file.close(); // don't forget to close reader
 * 
 * Use it in a http response
 * 
 *     const start = 10;
 *     const end = 20;
 *     const size = (await Deno.stat("/path/to/file")).size;
 *     
 *     req.respond({
 *       status: 206,
 *       headers: new Headers({
 *         "Accept-Ranges": "bytes",
 *         "Content-Range": `bytes ${start}-${end}/${size}`,
 *         "Content-Length": (end - start + 1).toString(),
 *       }),
 *       body: await Chunk.open("/path/to/file", start, end)
 *     });
 */
export class Chunk extends Deno.File {
  private start: number;
  private current: number = -1;
  private end: number;

  constructor(rid: number, start: number, end: number = -1) {
    super(rid);
    if (start < 0) {
      throw new Error("Invalid negatif start");
    }
    this.start = start;
    this.end = end;
  }

  async read(p: Uint8Array): Promise<number | null> {
    if (this.current === -1) {
      await super.seek(this.start, Deno.SeekMode.Start);
      this.current = this.start;
    }

    if (this.end === -1) {
      return super.read(p);
    }

    if (this.current >= this.end) {
      return null;
    }

    if (this.current + p.length < this.end) {
      this.current += p.length;
      return super.read(p);
    }

    const size = this.end - this.current;
    const v = new Uint8Array(size);
    const result = await super.read(v);
    p.set(v);
    this.current = this.end;

    return result;
  }

  readSync(p: Uint8Array): number | null {
    if (this.current === -1) {
      super.seekSync(this.start, Deno.SeekMode.Start);
      this.current = this.start;
    }

    if (this.end === -1) {
      return super.readSync(p);
    }

    if (this.current >= this.end) {
      return null;
    }

    if (this.current + p.length < this.end) {
      this.current += p.length;
      return super.readSync(p);
    }

    const size = this.end - this.current;
    const v = new Uint8Array(size);
    const result = super.readSync(v);
    p.set(v);
    this.current = this.end;

    return result;
  }

  static async open(filename: string, start: number, end?: number): Promise<Chunk> {
    return new Chunk(
      (await Deno.open(filename, { read: true, write: false })).rid,
      start,
      end,
    );
  }

  static openSync(filename: string, start: number, end?: number): Chunk {
    return new Chunk(
      Deno.openSync(filename, { read: true, write: false }).rid,
      start,
      end,
    );
  }
}
