import type { GlobalToken } from 'antd';

export interface EChartsThemeColors {
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderSecondary: string;
  background: string;
  backgroundLight: string;
}

export const getEChartsThemeColors = (token: GlobalToken): EChartsThemeColors => {
  return {
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    textTertiary: token.colorTextTertiary,
    border: token.colorBorder,
    borderSecondary: token.colorBorderSecondary,
    background: token.colorBgContainer,
    backgroundLight: token.colorBgLayout,
  };
};

export const getChartTextColor = (token: GlobalToken) => token.colorText;
export const getChartSubTextColor = (token: GlobalToken) => token.colorTextSecondary;
export const getChartBorderColor = (token: GlobalToken) => token.colorBorder;
export const getChartSplitLineColor = (token: GlobalToken) => token.colorBorderSecondary;
export const getChartBgColor = (token: GlobalToken) => token.colorBgContainer;
