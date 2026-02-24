import type { ThemeConfig } from 'antd';
import { ConfigProvider, theme } from 'antd';
import antdEnUS from 'antd/locale/en_US';
import antdZhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import { createContext, useContext, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import enUSMessages from '@/lang/en.json';
import zhCNMessages from '@/lang/zh.json';
import 'dayjs/locale/zh-cn';

interface Messages {
  'zh-CN': Record<string, string>;
  'en-US': Record<string, string>;
}

interface LocaleContextType {
  lang: 'zh-CN' | 'en-US';
  themeMode: 'light' | 'dark';
  changeLang: (langValue: 'zh-CN' | 'en-US') => void;
  changeThemeMode: (themeModeValue: 'light' | 'dark') => void;
  antdLocale: typeof antdZhCN;
}

const defaultContext: LocaleContextType = {
  lang: 'zh-CN',
  themeMode: 'light',
  changeLang: (_langValue: 'zh-CN' | 'en-US') => {
    /* no-op */
  },
  changeThemeMode: (_themeModeValue: 'light' | 'dark') => {
    /* no-op */
  },
  antdLocale: antdZhCN,
};

const LocaleContext = createContext<LocaleContextType>(defaultContext);

const getThemeConfig = (mode: 'light' | 'dark'): ThemeConfig => {
  const isDark = mode === 'dark';

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#177ddc' : '#1890ff',
      borderRadius: isDark ? 4 : 6,
      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      colorBgElevated: isDark ? '#262626' : '#ffffff',
      colorBgLayout: isDark ? '#141414' : '#f5f5f5',
      colorBgSpotlight: isDark ? '#2a2a2a' : '#fafafa',
      colorText: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      colorTextTertiary: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      colorTextQuaternary: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
      colorBorder: isDark ? '#434343' : '#d9d9d9',
      colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#141414' : '#f5f5f5',
        headerBg: isDark ? '#1f1f1f' : '#ffffff',
        siderBg: isDark ? '#1f1f1f' : '#ffffff',
        triggerBg: isDark ? '#262626' : '#ffffff',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemSelectedBg: 'rgba(23, 125, 220, 0.2)',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
      },
      Button: {
        primaryShadow: isDark ? '0 2px 0 #0d5aa7' : '0 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  };
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const messages: Messages = useMemo(
    () => ({
      'zh-CN': zhCNMessages,
      'en-US': enUSMessages,
    }),
    [],
  );

  const antdLocale = lang === 'en-US' ? antdEnUS : antdZhCN;

  const changeLang = (langValue: 'zh-CN' | 'en-US') => {
    setLang(langValue);
    dayjs.locale(langValue === 'en-US' ? 'en' : 'zh-cn');
  };

  const changeThemeMode = (themeModeValue: 'light' | 'dark') => {
    setThemeMode(themeModeValue);
  };

  const themeConfig = useMemo(() => getThemeConfig(themeMode), [themeMode]);

  return (
    <LocaleContext.Provider value={{ lang, changeLang, antdLocale, themeMode, changeThemeMode }}>
      <IntlProvider locale={lang} messages={messages[lang]}>
        <ConfigProvider locale={antdLocale} theme={themeConfig}>
          {children}
        </ConfigProvider>
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
