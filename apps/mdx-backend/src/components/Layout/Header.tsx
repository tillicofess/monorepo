import { Button, Tooltip } from "antd";
import { Globe, Menu, Moon, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
	themeMode: "light" | "dark";
	isMobile: boolean;
	lang: "zh-CN" | "en-US";
	userName?: string | undefined;
	notificationCount?: number;
	onToggleMenu: () => void;
	onChangeLang: (lang: "zh-CN" | "en-US") => void;
	onChangeThemeMode: (mode: "light" | "dark") => void;
	onLogout: () => void;
}

export function Header({
	themeMode,
	isMobile,
	lang,
	userName,
	onToggleMenu,
	onChangeLang,
	onChangeThemeMode,
	onLogout,
}: HeaderProps) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				marginInline: 20,
				alignItems: "center",
				height: "100%",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
				<Logo collapsed={false} themeMode={themeMode} />
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Tooltip title={lang === "en-US" ? "切换到中文" : "Switch to English"}>
					<Button
						type="text"
						size="middle"
						icon={<Globe size={18} />}
						onClick={() => onChangeLang(lang === "en-US" ? "zh-CN" : "en-US")}
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

				<Tooltip
					title={
						themeMode === "light" ? "切换到深色模式" : "Switch to light mode"
					}
				>
					<Button
						type="text"
						size="middle"
						icon={
							themeMode === "light" ? <Moon size={18} /> : <Sun size={18} />
						}
						onClick={() =>
							onChangeThemeMode(themeMode === "light" ? "dark" : "light")
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

				<UserMenu userName={userName ?? ""} onLogout={onLogout} />
			</div>
		</div>
	);
}
