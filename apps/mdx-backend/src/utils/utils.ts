import {
  addDays,
  addHours,
  endOfDay,
  endOfHour,
  format,
  startOfDay,
  startOfHour,
  subDays,
  subHours,
} from 'date-fns';

// 魔法时间戳，用于表示网站最初创建的时间
const MAGIC_START_TIMESTAMP = 1765621562776;

/**
 * 获取时间范围
 * @param {number} id - 时间范围标识符
 * @description
 * 0：全部时间（从网站创建至今）
 * 1：最近24小时（按小时统计）
 * 其他数值：最近n天（按天统计）
 * @returns {{ startAt: number; endAt: number; unit: string }} 包含开始时间、结束时间和时间单位的对象
 */
export const getTimeRange = (
  id: number,
): { startAt: number; endAt: number; unit: 'hour' | 'day' } => {
  // 获取当前时间
  const now = new Date();
  // 今天结束时间
  const endOfToday = endOfDay(now).getTime();

  // 定义时间单位常量
  const UNIT = {
    HOUR: 'hour' as const,
    DAY: 'day' as const,
  };

  // 根据id返回不同的时间范围
  switch (id) {
    // 全部时间
    case 0:
      return {
        startAt: MAGIC_START_TIMESTAMP,
        endAt: endOfToday,
        unit: UNIT.DAY,
      };

    // 最近24小时
    case 1:
      return {
        startAt: startOfHour(subHours(now, 23)).getTime(),
        endAt: endOfHour(now).getTime(),
        unit: UNIT.HOUR,
      };

    // 最近n天
    default:
      return {
        startAt: startOfDay(subDays(now, id)).getTime(),
        endAt: endOfToday,
        unit: UNIT.DAY,
      };
  }
};

/**
 * 填充缺失的数据点，确保时间范围内的所有时间点都有数据
 * @param {Array<{x: string; y: number}>} data - 原始数据数组
 * @param {number} startAt - 开始时间戳
 * @param {number} endAt - 结束时间戳
 * @param {"hour" | "day"} unit - 时间单位
 * @returns {Array<{x: string; y: number}>} 填充后的数据数组
 */
export function fillMissingData(
  data: Array<{ x: string; y: number }> = [],
  startAt: number,
  endAt: number,
  unit: 'hour' | 'day',
): Array<{ x: string; y: number }> {
  // 如果没有数据，直接返回空数组
  if (!Array.isArray(data)) {
    return [];
  }

  const result: Array<{ x: string; y: number }> = [];
  const step = unit === 'hour' ? addHours : addDays;

  // 使用常量定义时间格式，提高可维护性
  const TIME_FORMAT = unit === 'hour' ? 'yyyy-MM-dd HH:00:00' : 'yyyy-MM-dd 00:00:00';

  // 创建数据映射，提高查找效率
  const dataMap = new Map(data.map((item) => [item.x, item.y]));

  let current = new Date(startAt);
  const end = new Date(endAt);

  // 使用 <= 确保包含结束时间点
  while (current.getTime() <= end.getTime()) {
    const timeStr = format(current, TIME_FORMAT);

    // 使用空值合并运算符，如果没有数据则为0
    result.push({
      x: timeStr,
      y: dataMap.get(timeStr) ?? 0,
    });

    // 增加时间步长
    current = step(current, 1);
  }

  return result;
}

/**
 * 计算当前值与前一个值的变化百分比和趋势
 * @param {number} current - 当前值
 * @param {number} previous - 前一个值
 * @returns {{ percent: number; isIncrease: boolean }} 包含变化百分比和趋势的对象
 */
export const calculateChange = (
  current: number,
  previous: number,
): { percent: number; isIncrease: boolean } => {
  if (previous === 0) return { percent: 0, isIncrease: true };
  const change = current - previous;
  const percent = Math.round((change / previous) * 100);
  return { percent, isIncrease: change >= 0 };
};

/**
 * 格式化文件大小为易读的字符串
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串（如："123.45 KB"）
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};
