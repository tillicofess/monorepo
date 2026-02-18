export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // 类型枚举
        'type-enum': [
            2,
            'always',
            [
                'feat', // 新功能
                'fix', // Bug 修复
                'docs', // 文档更新
                'style', // 代码格式（不影响功能）
                'refactor', // 重构
                'perf', // 性能优化
                'test', // 测试相关
                'build', // 构建系统或外部依赖变化
                'ci', // CI 配置文件和脚本变化
                'chore', // 其他不修改源代码的变化
                'revert', // 回滚之前的提交
            ],
        ],
    },
    prompt: {
        messages: {
            type: '选择你的提交类型:',
            scope: '选择一个 scope (可选):',
            customScope: '输入自定义 scope:',
            subject: '简短描述:',
            body: "详细描述 (可选). 使用 '|' 换行:",
            breaking: '是否有破坏性变更? (y/N)',
            breakingBody: '描述破坏性变更:',
            footerPrefixesSelect: '选择关联的 issue 类型:',
            customFooterPrefix: '输入自定义 prefix:',
            footer: '关联的 Issue (可选). 例如: #123, #456:',
            generatingByAI: '正在通过 AI 生成提交描述...',
            generatedSelect: '选择以下选项之一:',
            confirmCommit: '确定提交?',
        },
        types: [
            { value: 'feat', name: 'feat:     新功能', emoji: '✨' },
            { value: 'fix', name: 'fix:      Bug 修复', emoji: '🐛' },
            { value: 'docs', name: 'docs:    文档更新', emoji: '📝' },
            { value: 'style', name: 'style:   代码格式', emoji: '💄' },
            { value: 'refactor', name: 'refactor: 重构', emoji: '♻️' },
            { value: 'perf', name: 'perf:    性能优化', emoji: '⚡️' },
            { value: 'test', name: 'test:    测试相关', emoji: '✅' },
            { value: 'ci', name: 'ci:      CI 配置', emoji: '👷' },
            { value: 'chore', name: 'chore:   更改构建流程或辅助工具', emoji: '🔧' },
            { value: 'revert', name: 'revert:  回滚提交', emoji: '⏪' },
        ],
        scopes: [
            { name: 'app' },
            { name: 'packages' },
            { name: 'config' },
            { name: 'deps' },
            { name: 'docs' },
            { name: 'workflow' },
            { name: 'release' },
        ],
    },
};
