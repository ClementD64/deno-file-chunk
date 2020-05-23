import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { Chunk } from "./mod.ts";

async function createData(size: number): Promise<[string, Uint8Array]> {
  const tmp = await Deno.makeTempFile();
  const data = crypto.getRandomValues(new Uint8Array(size));
  await Deno.writeFile(tmp, data);
  return [tmp, data];
}

function test(size: number, start: number, end?: number) {
  return async function () {
    const [file, data] = await createData(size);

    const chunk = await Chunk.open(file, start, end);
    assertEquals(await Deno.readAll(chunk), data.slice(start, end));
    chunk.close();

    await Deno.remove(file);
  };
}

function testSync(size: number, start: number, end?: number) {
  return async function () {
    const [file, data] = await createData(size);

    const chunk = Chunk.openSync(file, start, end);
    assertEquals(Deno.readAllSync(chunk), data.slice(start, end));
    chunk.close();

    await Deno.remove(file);
  };
}

Deno.test("Read inside async", test(100, 20, 80));
Deno.test("Read inside sync", testSync(100, 20, 80));

Deno.test("Read start async", test(100, 0, 50));
Deno.test("Read start sync", testSync(100, 0, 50));

Deno.test("Read end async", test(100, 50));
Deno.test("Read end sync", testSync(100, 50));

Deno.test("Read inside large async", test(10000, 2000, 8000));
Deno.test("Read inside large sync", testSync(10000, 2000, 8000));

Deno.test("Read start large async", test(10000, 0, 5000));
Deno.test("Read start large sync", testSync(10000, 0, 5000));

Deno.test("Read end large async", test(10000, 5000));
Deno.test("Read end large sync", testSync(10000, 5000));

Deno.test("Read larger async", test(100, 0, 101));
Deno.test("Read larger sync", testSync(100, 0, 101));

Deno.test("End before start async", test(100, 50, 40));
Deno.test("End before start sync", testSync(100, 50, 40));

Deno.test("Invalid start", function () {
  assertThrows(() => {
    new Chunk(Deno.stdin.rid, -1);
  });
});
