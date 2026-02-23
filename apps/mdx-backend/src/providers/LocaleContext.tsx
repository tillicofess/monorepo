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
  antdLocale: any; // 或者导入具体的 Antd 语言包类型
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

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // react-intl messages
  const messages: Messages = useMemo(
    () => ({
      'zh-CN': zhCNMessages,
      'en-US': enUSMessages,
    }),
    [],
  );

  // antd locale
  const antdLocale = lang === 'en-US' ? antdEnUS : antdZhCN;

  // 切换语言
  const changeLang = (langValue: 'zh-CN' | 'en-US') => {
    setLang(langValue);
    dayjs.locale(langValue === 'en-US' ? 'en' : 'zh-cn');
  };

  const changeThemeMode = (themeModeValue: 'light' | 'dark') => {
    setThemeMode(themeModeValue);
  };

  return (
    <LocaleContext.Provider value={{ lang, changeLang, antdLocale, themeMode, changeThemeMode }}>
      <IntlProvider locale={lang} messages={messages[lang]}>
        <ConfigProvider
          locale={antdLocale}
          theme={{
            algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorPrimary: themeMode === 'dark' ? '#f2f4f4' : '#1890ff',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
