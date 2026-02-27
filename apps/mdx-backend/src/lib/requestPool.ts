type Task<T = any> = () => Promise<T>;

class RequestPool {
    private queue: Task[] = [];
    private running = 0;
    private max: number;

    constructor(max: number) {
        this.max = max;
    }

    add<T>(task: Task<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                this.running++;
                console.log('当前并发数:', this.running);

                try {
                    const result = await task();
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    this.running--;
                    console.log('结束后并发数:', this.running); 
                    this.next();
                }
            };

            this.queue.push(wrappedTask);
            this.next();
        });
    }

    private next() {
        if (this.running >= this.max) return;
        const task = this.queue.shift();
        if (task) task();
    }
}

export const globalRequestPool = new RequestPool(2); // 全局最大并发