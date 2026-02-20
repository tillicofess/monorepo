import {
  capitalize,
  debounce,
  deepClone,
  formatNumber,
  generateId,
  groupBy,
  isEmpty,
  randomInt,
  retry,
  sleep,
  truncate,
  unique,
} from '@monorepo/utils';

// 示例：深拷贝
const original = {
  name: 'test',
  nested: { value: 123 },
  date: new Date(),
  items: [1, 2, 3],
};
const cloned = deepClone(original);
console.log('深拷贝结果:', cloned);
console.log('深拷贝验证 (应该为 false):', original.nested === cloned.nested);

// 示例：判断空值
console.log('isEmpty(null):', isEmpty(null));
console.log('isEmpty([]):', isEmpty([]));
console.log('isEmpty({}):', isEmpty({}));
console.log('isEmpty("hello"):', isEmpty('hello'));

// 示例：防抖函数
const debouncedLog = debounce((msg: string) => {
  console.log('防抖输出:', msg);
}, 300);

debouncedLog('第一次');
debouncedLog('第二次');
debouncedLog('最终'); // 只有这个会执行

// 示例：随机数
console.log('随机整数 1-100:', randomInt(1, 100));

// 示例：生成唯一 ID
console.log('唯一 ID:', generateId('user_'));
console.log('唯一 ID:', generateId());

// 示例：格式化数字
console.log('格式化数字:', formatNumber(1234567.89, 2));

// 示例：截断字符串
console.log('截断字符串:', truncate('这是一段很长的文本内容', 10));

// 示例：首字母大写
console.log('首字母大写:', capitalize('hello world'));

// 示例：数组去重
const duplicates = [1, 2, 2, 3, 3, 3, 4];
console.log('去重结果:', unique(duplicates));

// 示例：按属性分组
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' },
];
console.log('按角色分组:', groupBy(users, 'role'));

// 示例：异步休眠
async function demoSleep() {
  console.log('开始休眠...');
  await sleep(1000);
  console.log('休眠结束');
}

// 示例：重试机制
async function fetchWithRetry() {
  const result = await retry(
    async () => {
      // 模拟可能失败的请求
      if (Math.random() < 0.7) {
        throw new Error('请求失败');
      }
      return '成功获取数据';
    },
    { times: 5, delay: 100 },
  );
  console.log('重试结果:', result);
}

// 执行异步示例
demoSleep();
fetchWithRetry();
