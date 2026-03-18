import { createIntl } from "react-intl";
import enUSMessages from "@/lang/en.json";
import zhCNMessages from "@/lang/zh.json";

const messages = {
	"zh-CN": zhCNMessages,
	"en-US": enUSMessages,
};

export const intl = createIntl({
	locale: "zh-CN",
	messages: messages["zh-CN"],
});

export const formatMessage = (
	id: string,
	values?: Record<string, string | number>,
) => {
	return intl.formatMessage({ id }, values);
};
