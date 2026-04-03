import { Dropdown, type MenuProps, theme } from "antd";
import { ChevronDown, LogOut, User } from "lucide-react";
import { FormattedMessage } from "react-intl";

interface UserMenuProps {
	userName?: string;
	onLogout: () => void;
}

export function UserMenu({ userName, onLogout }: UserMenuProps) {
	const { token } = theme.useToken();

	// 对应图2的多个菜单选项
	const userMenuItems: MenuProps["items"] = [
		{
			key: "logout",
			icon: <LogOut size={16} />,
			label: <FormattedMessage id="logout" defaultMessage="Logout" />,
			onClick: onLogout,
		},
	];

	return (
		<Dropdown
			menu={{
				items: userMenuItems,
			}}
			styles={{
				root: {
					border: `1px solid ${token.colorBorderSecondary}`,
					borderColor: `${token.colorBorderSecondary}`,
					borderRadius: 6,
				},
			}}
			trigger={["click"]}
			placement="bottom"
		>
			<div
				style={{
					cursor: "pointer",
					padding: "8px 12px",
					borderRadius: 6, // 图2圆角较小
					border: `1px solid ${token.colorBorderSecondary}`,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					background: token.colorBgContainer,
					transition: "all 0.2s ease",
					width: "100%", // 占据侧边栏宽度
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<User
						size={18}
						strokeWidth={1.5}
						style={{ color: token.colorTextTertiary }}
					/>
					<span
						style={{
							fontWeight: 400, // 图2字体较细
							fontSize: 14,
							color: token.colorText,
							maxWidth: 120,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{userName || "User"}
					</span>
				</div>

				{/* 右侧下箭头 */}
				<ChevronDown size={14} style={{ color: token.colorTextTertiary }} />
			</div>
		</Dropdown>
	);
}
