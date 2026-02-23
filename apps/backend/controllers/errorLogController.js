import pool from "../config/db.js";
import { createFingerprint } from './error/fingerprint.js';

// 创建日志
export const createLog = async (req, res) => {
  try {
    const body = req.body;

    const { type, subType } = body;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Missing type field' });
    }

    if (type === 'error') {
      await handleErrorLog(body);
    }
    else if (type === 'performance') {
      subType === 'waterfall' ? await insertWaterfallLog(body) : await handlePerformanceLog(body);
    }
    else {
      return res.status(400).json({ success: false, message: 'Unknown log type' });
    }

    res.status(201).json({ success: true });

  } catch (err) {
    console.error("❌ createLog error:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to save log',
      error: err.message
    });
  }
};

// 获取全部日志
export const getAllLogs = async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM error_logs
      ORDER BY time DESC
      LIMIT 100
    `;

    const [rows] = await pool.query(sql);

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error("❌ getAllLogs error:", err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: err.message,
    });
  }
};

// 处理错误日志
async function handleErrorLog(body) {
  const { error, actions, time, version } = body;
  if (!error || !time || !version) {
    throw new Error('Missing error, time or version field');
  }

  const fingerprint = createFingerprint(error);

  const [rows] = await pool.execute(
    'SELECT id, count FROM error_logs WHERE fingerprint = ?',
    [fingerprint]
  );

  if (rows.length > 0) {
    // 2. 已存在 → count +1
    await pool.execute(
      `
      UPDATE error_logs 
      SET count = count + 1, updated_at = NOW() 
      WHERE fingerprint = ?
      `,
      [fingerprint]
    );
  } else {
    // 3. 新错误 → 插入
    await pool.execute(
      `
      INSERT INTO error_logs 
      (fingerprint, error, actions, time, version, count)
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [
        fingerprint,
        JSON.stringify(error),
        JSON.stringify(actions || []),
        time,
        version
      ]
    );
  }
}

// 处理性能日志
async function handlePerformanceLog(body) {
  const {
    subType,
    value,
    url,
    appName,
    version,
    effectiveType,
    time
  } = body;

  if (!subType || value == null || !url || !appName || !version || !time) {
    throw new Error('Missing required performance fields');
  }

  // 1️⃣ 数据清洗：忽略慢网或者异常值
  const badNet = ['2g', 'slow-2g'];
  if (badNet.includes(effectiveType)) return;

  if (value < 0 || value > 60000) return; // 超过 60s 的指标直接丢弃

  // 2️⃣ 插入数据库
  const sql = `
    INSERT INTO performance_logs
    (app_name, url, sub_type, value, version, effective_type, time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    appName,
    url,
    subType,
    value,
    version,
    effectiveType || 'unknown',
    time
  ];

  await pool.execute(sql, params);
}

// 获取所有应用名称
export const getAppNames = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT app_name
      FROM performance_logs
      ORDER BY app_name
    `;
    const [rows] = await pool.query(sql);

    res.json({
      success: true,
      data: rows.map(r => r.app_name)
    });
  } catch (err) {
    console.error('❌ getAppNames error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 获取指定应用的所有 URL
export const getUrlsByApp = async (req, res) => {
  try {
    const { appName } = req.params;
    if (!appName) {
      return res.status(400).json({ success: false, message: 'Missing appName' });
    }

    const sql = `
      SELECT DISTINCT url
      FROM performance_logs
      WHERE app_name = ?
      ORDER BY url
    `;
    const [rows] = await pool.execute(sql, [appName]);

    res.json({
      success: true,
      data: rows.map(r => r.url)
    });
  } catch (err) {
    console.error('❌ getUrlsByApp error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 插入瀑布图日志
export async function insertWaterfallLog(body) {
  const {
    url,
    appName,
    version,
    effectiveType,
    time,
    value
  } = body;

  if (!url || !appName || !version || !time || !value) {
    throw new Error('Missing required waterfall fields');
  }

  const sql = `
    INSERT INTO waterfall_metrics
    (app_name, url, version, effective_type,
      dns_lookup, tcp_connection, ssl_connection, ttfb,
      content_transfer, content_parsing, resource_loading, total_time,
      time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    appName,
    url,
    version,
    effectiveType || 'unknown',
    value.dnsLookup,
    value.tcpConnection,
    value.sslConnection,
    value.ttfb,
    value.contentTransfer,
    value.contentParsing,
    value.resourceLoading,
    value.totalTime,
    time
  ];

  await pool.execute(sql, params);
}

// 获取页面性能指标（75%、90% 分位数）
export const getPagePerformance = async (req, res) => {
  try {
    const { appName, url } = req.query;

    if (!appName || !url) {
      return res.status(400).json({
        success: false,
        message: 'Missing appName or url'
      });
    }

    const sql = `
      WITH ranked AS (
        SELECT
          sub_type,
          value,
          ROW_NUMBER() OVER (
            PARTITION BY sub_type
            ORDER BY value
          ) AS rn,
          COUNT(*) OVER (
            PARTITION BY sub_type
          ) AS cnt
        FROM performance_logs
        WHERE app_name = ?
          AND url = ?
          AND sub_type IN ('lcp', 'fid', 'cls', 'fcp')
          AND created_at >= NOW() - INTERVAL 30 DAY
      )
      SELECT
        sub_type,
        MAX(CASE WHEN rn = CEIL(cnt * 0.75) THEN value END) AS p75,
        MAX(CASE WHEN rn = CEIL(cnt * 0.90) THEN value END) AS p90,
        cnt AS total
      FROM ranked
      GROUP BY sub_type
      ORDER BY sub_type;
    `;

    const [rows] = await pool.execute(sql, [appName, url]);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('❌ getPagePerformance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 获取指定应用和 URL 的最新瀑布图数据
export async function getWaterfallByAppAndUrl(req, res) {
  try {
    const { appName, url } = req.query;

    if (!appName || !url) {
      return res.status(400).json({
        success: false,
        message: 'Missing appName or url'
      });
    }
    const sql = `
    SELECT *
    FROM waterfall_metrics
    WHERE app_name = ? AND url = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

    const [rows] = await pool.execute(sql, [appName, url]);

    const row = rows[0];

    if (rows.length === 0) {
      return res.json({
        code: 404,
        success: false,
        message: 'No waterfall data found'
      });
    }

    // 只返回指定字段
    const data = {
      effective_type: row.effective_type,
      dns_lookup: row.dns_lookup,
      tcp_connection: row.tcp_connection,
      ssl_connection: row.ssl_connection,
      ttfb: row.ttfb,
      content_transfer: row.content_transfer,
      content_parsing: row.content_parsing,
      resource_loading: row.resource_loading,
      total_time: row.total_time,
    };

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('❌ getWaterfallByAppAndUrl error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}
