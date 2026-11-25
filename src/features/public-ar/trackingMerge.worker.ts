import { decode, encode } from "@msgpack/msgpack";

const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<Blob[]>) => void;
  postMessage(data: unknown, transfer: Transferable[]): void;
};
scope.onmessage = async ({ data: assets }) => {
  try {
    if (!Array.isArray(assets) || assets.length > 50 || !assets.length) throw new Error("Invalid album");
    const dataList: unknown[] = [];
    for (const asset of assets) {
      const content = decode(new Uint8Array(await asset.arrayBuffer())) as { v?: unknown; dataList?: unknown[] };
      if (content.v !== 2 || !Array.isArray(content.dataList) || content.dataList.length !== 1)
        throw new Error("Invalid target");
      dataList.push(content.dataList[0]);
    }
    const bytes = new Uint8Array(encode({ v: 2, dataList }));
    scope.postMessage(bytes.buffer, [bytes.buffer]);
  } catch {
    scope.postMessage(null, []);
  }
};
