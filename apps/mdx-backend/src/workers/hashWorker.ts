import SparkMD5 from "spark-md5";

self.onmessage = (
	e: MessageEvent<{ chunk: ArrayBuffer; chunkIndex: number }>,
) => {
	const { chunk, chunkIndex } = e.data;

	const spark = new SparkMD5.ArrayBuffer();
	spark.append(chunk);
	const hash = spark.end();

	self.postMessage({ hash, chunkIndex });
};
