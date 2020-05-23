# Deno File Chunk [![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/file_chunk/mod.ts)

Read a chunk of file

## install

```ts
import { Chunk } from "https://deno.land/x/file_chunk/mod.ts";
```

## Example
 
```ts
// read only byte 20 to 30
const file = Chunk.openSync("/path/to/file", 20, 30);
const data = Deno.readAllSync(file);
file.close(); // don't forget to close reader
```

Use it in a http response

```ts 
const start = 10;
const end = 20;
const size = (await Deno.stat("/path/to/file")).size;

req.respond({
  status: 206,
  headers: new Headers({
    "Accept-Ranges": "bytes",
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Content-Length": (end - start + 1).toString(),
  }),
  body: await Chunk.open("/path/to/file", start, end)
});
```