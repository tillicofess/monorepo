import { Button, Tooltip } from "antd";
import { Globe, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "@/providers/auth/auth";
import { useLocale } from "@/providers/LocaleContext";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
	isMobile: boolean;
	onToggleMenu: () => void;
}

const themeLabels = {
	"en-US": { light: "Switch to dark mode", dark: "Switch to light mode" },
	"zh-CN": { light: "切换到深色模式", dark: "切换到浅色模式" },
};

export function Header({ isMobile, onToggleMenu }: HeaderProps) {
	const { lang, themeMode, changeLang, changeThemeMode } = useLocale();
	const { user, logout } = useAuth();
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				marginInline: isMobile ? 12 : 20,
				alignItems: "center",
				height: "100%",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: isMobile ? 8 : 16,
				}}
			>
				{isMobile && (
					<Tooltip title="展开菜单">
						<Button
							type="text"
							icon={<Menu size={20} />}
							onClick={onToggleMenu}
							style={{
								width: 40,
								height: 40,
								borderRadius: 8,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						/>
					</Tooltip>
				)}
				{!isMobile && <Logo collapsed={false} themeMode={themeMode} />}
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Tooltip title={lang === "en-US" ? "切换到中文" : "Switch to English"}>
					<Button
						type="text"
						size="middle"
						icon={<Globe size={18} />}
						onClick={() => changeLang(lang === "en-US" ? "zh-CN" : "en-US")}
						style={{
							height: 40,
							width: 40,
							borderRadius: 8,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					/>
				</Tooltip>

				<Tooltip title={themeLabels[lang][themeMode]}>
					<Button
						type="text"
						size="middle"
						icon={
							themeMode === "light" ? <Moon size={18} /> : <Sun size={18} />
						}
						onClick={() =>
							changeThemeMode(themeMode === "light" ? "dark" : "light")
						}
						style={{
							height: 40,
							width: 40,
							borderRadius: 8,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					/>
				</Tooltip>

				<UserMenu userName={user?.name ?? ""} onLogout={logout} />
			</div>
		</div>
	);
}
