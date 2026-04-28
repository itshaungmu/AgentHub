import { getPermissionRiskLevel, getTrustBadges } from './manifest.js';

// i18n translations
const i18n = {
  en: {
    title: "AgentHub - AI Agent Open Source Community",
    navHome: "Home",
    navStats: "Stats",
    heroTitle: "AgentHub",
    heroSubtitle: "Discover open source Agents for your workflow · Install to your AI assistant in one click · Publish, version and share your Agent capabilities",
    statAgents: "Available Agents",
    statDownloads: "Total Downloads",
    statOpenSource: "Open Source",
    feature1Title: "Ready to Use",
    feature1Desc: "Skip complex configurations, get battle-tested AI Agent setups",
    feature2Title: "Instant Deploy",
    feature2Desc: "One-click install, deploy in minutes, start working immediately",
    feature3Title: "Version Control",
    feature3Desc: "Automatic version upgrades, always stay with the latest capabilities",
    apiBoxTitle: "AI Auto-Discovery API",
    apiBoxDesc: "Let your AI assistant automatically discover and install Agents",
    sectionHotAgents: "Hot Agents",
    sectionViewAll: "View All →",
    searchPlaceholder: "Search Agents, skills, tags...",
    searchButton: "Search",
    downloads: "downloads",
    install: "Install",
    howToUse: "How to Use",
    step1Title: "Browse & Discover",
    step1Desc: "Find the Agent that fits your workflow",
    step2Title: "One-Click Install",
    step2Desc: "Run the install command, deploy in minutes",
    step3Title: "Start Working",
    step3Desc: "Your AI assistant is ready, start delegating tasks",
    noAgents: "No Agents yet",
    noAgentsHint: "Use <code>agenthub pack</code> to package your first Agent!",
    // Detail page
    backToHome: "← Back to Home",
    detailVersion: "Version",
    detailRuntime: "Runtime",
    detailDownloads: "Downloads",
    detailAuthor: "Author",
    detailInstall: "Install Command",
    personaTitle: "🎭 Personality",
    personaTraits: "Traits",
    personaExpertise: "Expertise",
    memoryTitle: "🧠 Memory Config",
    memoryPublic: "Public",
    memoryPortable: "Portable",
    memoryPrivate: "Private",
    memoryNoData: "No memory data",
    skillsTitle: "🔧 Skills",
    tagsTitle: "🏷️ Tags",
    requirementsTitle: "⚙️ System Requirements",
    requirementsNone: "No special requirements",
    requirementsEnv: "🔐 Environment variables required:",
    requirementsModel: "🤖 Recommended model:",
    requirementsRuntime: "⚡ Runtime version:",
    installMethodTitle: "📥 Installation",
    installMethodDesc: "Choose your environment and run the install command:",
    // P0: Permissions
    permissionsTitle: "🛡️ Permissions & Risk",
    permReadFiles: "Read Files",
    permWriteFiles: "Write Files",
    permExecuteShell: "Execute Shell",
    permNetworkAccess: "Network Access",
    permRequiresApiKey: "Requires API Key",
    permThirdPartyDeps: "Third-Party Dependencies",
    permRiskLevel: "Risk Level",
    permRiskLow: "Low",
    permRiskMedium: "Medium",
    permRiskHigh: "High",
    // P0: Compatibility
    compatibilityTitle: "🔗 Compatibility",
    compatPlatforms: "Platforms",
    compatMinVersion: "Min Version",
    compatTestedVersion: "Tested Version",
    compatLimitations: "Known Limitations",
    // P0: Hero CTA
    ctaBrowse: "Browse Agents",
    ctaInstall: "Install to My Assistant",
    ctaPublish: "Publish My Agent",
    // P1: Use Cases & Examples
    useCasesTitle: "🎯 Use Cases",
    useCasesSolves: "What it solves",
    useCasesScenarios: "Typical scenarios",
    useCasesNotSuitable: "Not suitable for",
    examplesTitle: "💡 Usage Examples",
    examplePrompt: "Prompt",
    exampleResult: "Expected Result",
    // P1: Install tab labels
    installTabOpenclaw: "OpenClaw",
    installTabClaudeCode: "Claude Code",
    installTabCursor: "Cursor",
    installTabGeneric: "Generic",
    installVerify: "Verify",
    installUpgrade: "Upgrade",
    installUninstall: "Uninstall",
    installRequirements: "Requirements",
    // Stats page
    statsTitle: "Statistics Center - AgentHub",
    statsHeader: "📊 Statistics Center",
    statsDesc: "AgentHub download statistics and data analysis",
    statsTotalAgents: "Agent Count",
    statsTotalDownloads: "Total Downloads",
    statsTotalLogs: "Download Logs",
    rankingTitle: "🏆 Download Ranking",
    rankingAgent: "Agent",
    rankingDownloads: "Downloads",
    rankingLastDownload: "Last Download",
    rankingRank: "Rank",
    recentTitle: "📋 Recent Downloads",
    recentAgent: "Agent",
    recentTime: "Time",
    recentTarget: "Target Path",
    noData: "No data",
    // Tags
    tagOps: "ops",
    tagEngineering: "engineering",
    tagContent: "content",
    tagProduct: "product",
    tagDefault: "default",
    // Homepage showcase modules
    sectionRecentlyUpdated: "🕐 Recently Updated",
    sectionZeroConfig: "🟢 Zero Config — Ready to Go",
    sectionVerified: "✅ Verified Agents",
    sectionGettingStarted: "🚀 Getting Started",
    gettingStartedDesc: "New to AgentHub? Here's how to get started in 3 minutes.",
    gettingStartedStep1: "Install Node.js 18+ on your machine",
    gettingStartedStep2: "Browse agents above and find one you like",
    gettingStartedStep3: "Run the install command in your workspace",
    gettingStartedStep4: "Start chatting with your AI assistant — the agent skills are ready!",
    gettingStartedDocs: "Read Full Documentation →",
    // Auth
    authLogin: "Login",
    authRegister: "Register",
    authLogout: "Logout",
    authMyTokens: "My Tokens",
    authUsername: "Username",
    authPassword: "Password",
    authEmail: "Email (optional)",
    authOrDivider: "or continue with",
    authGitHub: "GitHub",
    authGoogle: "Google",
    badgePrivacy: "Privacy Verified",
    badgeSigned: "Signed",
  },
  zh: {
    title: "AgentHub - AI Agent 开源社区",
    navHome: "首页",
    navStats: "统计",
    heroTitle: "AgentHub",
    heroSubtitle: "发现适合你工作流的开源 Agent · 一键安装到你的 AI 助手 · 发布、版本化并分享你的 Agent 能力",
    statAgents: "可用 Agent",
    statDownloads: "累计下载",
    statOpenSource: "开源免费",
    feature1Title: "开箱即用",
    feature1Desc: "跳过繁琐的配置，获取经过实战验证的 AI Agent 配置",
    feature2Title: "即装即用",
    feature2Desc: "一键安装，几分钟内部署完成，立即开始工作",
    feature3Title: "版本管理",
    feature3Desc: "自动版本升级，始终保持最新能力",
    apiBoxTitle: "🤖 AI 自动发现 API",
    apiBoxDesc: "让你的 AI 助手自动发现并安装 Agent",
    sectionHotAgents: "热门 Agent",
    sectionViewAll: "查看全部 →",
    searchPlaceholder: "搜索 Agent、技能、标签...",
    searchButton: "搜索",
    downloads: "次下载",
    install: "安装",
    howToUse: "如何使用",
    step1Title: "浏览发现",
    step1Desc: "找到适合你工作流程的 Agent",
    step2Title: "一键安装",
    step2Desc: "运行安装命令，几分钟内部署完成",
    step3Title: "开始工作",
    step3Desc: "你的 AI 助手已就绪，立即开始委托任务",
    noAgents: "暂无 Agent",
    noAgentsHint: "使用 <code>agenthub pack</code> 打包你的第一个 Agent 吧！",
    // Detail page
    backToHome: "← 返回首页",
    detailVersion: "版本",
    detailRuntime: "运行时",
    detailDownloads: "下载次数",
    detailAuthor: "作者",
    detailInstall: "安装命令",
    personaTitle: "🎭 性格简介",
    personaTraits: "特质",
    personaExpertise: "专长",
    memoryTitle: "🧠 记忆配置",
    memoryPublic: "公开",
    memoryPortable: "可移植",
    memoryPrivate: "私有",
    memoryNoData: "暂无记忆数据",
    skillsTitle: "🔧 技能",
    tagsTitle: "🏷️ 标签",
    requirementsTitle: "⚙️ 系统要求",
    requirementsNone: "无特殊要求",
    requirementsEnv: "🔐 需要配置环境变量:",
    requirementsModel: "🤖 推荐模型:",
    requirementsRuntime: "⚡ 运行时版本:",
    installMethodTitle: "📥 安装方式",
    installMethodDesc: "选择你的环境并运行安装命令：",
    // P0: Permissions
    permissionsTitle: "🛡️ 权限与风险",
    permReadFiles: "读取文件",
    permWriteFiles: "写入文件",
    permExecuteShell: "执行 Shell",
    permNetworkAccess: "访问网络",
    permRequiresApiKey: "需要 API Key",
    permThirdPartyDeps: "第三方依赖",
    permRiskLevel: "风险等级",
    permRiskLow: "低",
    permRiskMedium: "中",
    permRiskHigh: "高",
    // P0: Compatibility
    compatibilityTitle: "🔗 兼容性",
    compatPlatforms: "支持平台",
    compatMinVersion: "最低版本",
    compatTestedVersion: "测试版本",
    compatLimitations: "已知限制",
    // P0: Hero CTA
    ctaBrowse: "浏览 Agent",
    ctaInstall: "安装到我的助手",
    ctaPublish: "发布我的 Agent",
    // P1: Use Cases & Examples
    useCasesTitle: "🎯 适用场景",
    useCasesSolves: "解决什么问题",
    useCasesScenarios: "典型使用场景",
    useCasesNotSuitable: "不适合场景",
    examplesTitle: "💡 使用示例",
    examplePrompt: "提示词",
    exampleResult: "预期结果",
    // P1: Install tab labels
    installTabOpenclaw: "OpenClaw",
    installTabClaudeCode: "Claude Code",
    installTabCursor: "Cursor",
    installTabGeneric: "通用安装",
    installVerify: "验证安装",
    installUpgrade: "升级",
    installUninstall: "卸载",
    installRequirements: "依赖要求",
    // Stats page
    statsTitle: "统计中心 - AgentHub",
    statsHeader: "📊 统计中心",
    statsDesc: "AgentHub 下载统计与数据分析",
    statsTotalAgents: "Agent 数量",
    statsTotalDownloads: "累计下载",
    statsTotalLogs: "下载记录",
    rankingTitle: "🏆 下载排行榜",
    rankingAgent: "Agent",
    rankingDownloads: "下载次数",
    rankingLastDownload: "最后下载",
    rankingRank: "排名",
    recentTitle: "📋 最近下载",
    recentAgent: "Agent",
    recentTime: "时间",
    recentTarget: "目标路径",
    noData: "暂无数据",
    // Tags
    tagOps: "运维",
    tagEngineering: "工程",
    tagContent: "内容",
    tagProduct: "产品",
    tagDefault: "默认",
    // Homepage showcase modules
    sectionRecentlyUpdated: "🕐 最近更新",
    sectionZeroConfig: "🟢 零配置推荐",
    sectionVerified: "✅ 已验证 Agent",
    sectionGettingStarted: "🚀 新手入门",
    gettingStartedDesc: "第一次使用 AgentHub？3 分钟即可上手。",
    gettingStartedStep1: "安装 Node.js 18+ 环境",
    gettingStartedStep2: "在上方浏览并找到你感兴趣的 Agent",
    gettingStartedStep3: "在工作区运行安装命令",
    gettingStartedStep4: "开始与 AI 助手对话——Agent 技能已就绪！",
    gettingStartedDocs: "阅读完整文档 →",
    // Auth
    authLogin: "登录",
    authRegister: "注册",
    authLogout: "退出",
    authMyTokens: "我的 Token",
    authUsername: "用户名",
    authPassword: "密码",
    authEmail: "邮箱（可选）",
    authOrDivider: "或使用以下方式登录",
    authGitHub: "GitHub",
    authGoogle: "Google",
    badgePrivacy: "隐私已审查",
    badgeSigned: "已签名",
  }
};

// Language toggle script
const langScript = `
<script>
(function() {
  const defaultLang = 'en';
  const savedLang = localStorage.getItem('agenthub-lang') || defaultLang;

  function setLang(lang) {
    localStorage.setItem('agenthub-lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
        el.textContent = window.i18n[lang][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
        el.placeholder = window.i18n[lang][key];
      }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }

  function setTheme(theme) {
    localStorage.setItem('agenthub-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    const currentTheme = localStorage.getItem('agenthub-theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  window.setLang = setLang;
  window.toggleTheme = toggleTheme;
  window.i18n = ${JSON.stringify(i18n)};

  document.addEventListener('DOMContentLoaded', () => {
    setLang(savedLang);
    const savedTheme = localStorage.getItem('agenthub-theme') || 'light';
    setTheme(savedTheme);

    // Copy to clipboard
    async function copyText(text) {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
      const ta = Object.assign(document.createElement('textarea'), { value: text, style: 'position:fixed;opacity:0' });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    document.querySelectorAll('.api-code, .detail-install').forEach(el => {
      el.addEventListener('click', () => {
        const text = el.querySelector('.code-text')?.textContent.trim() || el.textContent.trim();
        const btn = el.querySelector('.copy-btn');
        copyText(text).then(() => {
          if (!btn) return;
          btn.textContent = '✓';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 1500);
        }).catch(e => console.error('Copy failed:', e));
      });
    });

    // === Client-side search & filter ===
    const searchInput = document.getElementById('agent-search');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const agentCards = document.querySelectorAll('.agent-card');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;
    const PAGE_SIZE = 12;
    let currentCategory = 'all';
    let searchTerm = '';

    function getFilteredCards() {
      return Array.from(agentCards).filter(card => {
        const matchCategory = currentCategory === 'all' || card.dataset.category === currentCategory;
        const matchSearch = !searchTerm || card.textContent.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
      });
    }

    function updateDisplay() {
      const filtered = getFilteredCards();
      agentCards.forEach(c => c.classList.add('hidden'));
      filtered.forEach(c => c.classList.remove('hidden'));

      visibleCount = Math.min(PAGE_SIZE, filtered.length);
      filtered.slice(0, visibleCount).forEach(c => c.classList.remove('hidden'));

      if (loadMoreBtn) {
        loadMoreBtn.style.display = visibleCount < filtered.length ? 'inline-block' : 'none';
      }
      if (noResults) {
        noResults.classList.toggle('show', filtered.length === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        updateDisplay();
      });
      // Prevent form submit for client-side search
      const form = searchInput.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          searchTerm = searchInput.value;
          updateDisplay();
        });
      }
    }

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        updateDisplay();
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const filtered = getFilteredCards();
        visibleCount = Math.min(visibleCount + PAGE_SIZE, filtered.length);
        filtered.slice(0, visibleCount).forEach(c => c.classList.remove('hidden'));
        loadMoreBtn.style.display = visibleCount < filtered.length ? 'inline-block' : 'none';
      });
    }

    updateDisplay();

    // === Install environment tab switching ===
    const installTabs = document.querySelectorAll('.install-tab');
    const installContents = document.querySelectorAll('.install-tab-content');
    installTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        installTabs.forEach(t => t.classList.remove('active'));
        installContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.classList.add('active');
      });
    });

    // === Scroll reveal animation ===
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // === Auth State Management ===
    const authToken = localStorage.getItem('agenthub-token');
    const authUser = JSON.parse(localStorage.getItem('agenthub-user') || 'null');

    function updateAuthUI() {
      const loginBtn = document.getElementById('auth-login-btn');
      const userMenu = document.getElementById('auth-user-menu');
      const avatarBtn = document.getElementById('auth-avatar-btn');
      const userLabel = document.getElementById('auth-dropdown-user');
      const token = localStorage.getItem('agenthub-token');
      const user = JSON.parse(localStorage.getItem('agenthub-user') || 'null');

      if (token && user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (avatarBtn) avatarBtn.textContent = user.avatar ? '' : user.username?.charAt(0)?.toUpperCase() || '👤';
        if (userLabel) userLabel.textContent = user.username || 'User';
      } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
      }
    }

    // Check OAuth providers and hide unconfigured ones
    fetch('/api/auth/providers').then(r => r.json()).then(data => {
      if (!data.providers) return;
      const ghBtn = document.getElementById('oauth-github');
      const goBtn = document.getElementById('oauth-google');
      const configured = data.providers.map(p => p.id);
      if (ghBtn && !configured.includes('github')) ghBtn.style.display = 'none';
      if (goBtn && !configured.includes('google')) goBtn.style.display = 'none';
      if (configured.length === 0) {
        const divider = document.querySelector('.auth-divider');
        const btns = document.getElementById('auth-oauth-btns');
        if (divider) divider.style.display = 'none';
        if (btns) btns.style.display = 'none';
      }
    }).catch(() => {});

    // If we have a token, verify it's still valid
    if (authToken) {
      fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + authToken } })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          localStorage.setItem('agenthub-user', JSON.stringify(data.user));
          updateAuthUI();
        })
        .catch(() => {
          localStorage.removeItem('agenthub-token');
          localStorage.removeItem('agenthub-user');
          updateAuthUI();
        });
    }

    updateAuthUI();

    // Set input placeholders
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const emailInput = document.getElementById('auth-email');
    if (usernameInput) usernameInput.placeholder = window.i18n[savedLang]?.authUsername || 'Username';
    if (passwordInput) passwordInput.placeholder = window.i18n[savedLang]?.authPassword || 'Password';
    if (emailInput) emailInput.placeholder = window.i18n[savedLang]?.authEmail || 'Email (optional)';
  });

  // Auth modal functions (global scope)
  let currentAuthMode = 'login';

  window.showAuthModal = function() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.add('show');
  };

  window.hideAuthModal = function() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.classList.remove('show');
    document.getElementById('auth-error').textContent = '';
  };

  window.switchAuthTab = function(mode) {
    currentAuthMode = mode;
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
    document.getElementById('auth-email').style.display = mode === 'register' ? 'block' : 'none';
    const submitBtn = document.getElementById('auth-submit-btn');
    const lang = localStorage.getItem('agenthub-lang') || 'en';
    submitBtn.textContent = window.i18n[lang]?.[mode === 'login' ? 'authLogin' : 'authRegister'] || mode;
    document.getElementById('auth-error').textContent = '';
  };

  window.handleAuthSubmit = async function(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const email = document.getElementById('auth-email').value.trim();
    const errorEl = document.getElementById('auth-error');

    const endpoint = currentAuthMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = { username, password };
    if (currentAuthMode === 'register' && email) body.email = email;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { errorEl.textContent = data.error || 'Error'; return; }

      localStorage.setItem('agenthub-token', data.token);
      localStorage.setItem('agenthub-user', JSON.stringify(data.user));
      window.hideAuthModal();

      // Refresh auth UI
      const loginBtn = document.getElementById('auth-login-btn');
      const userMenu = document.getElementById('auth-user-menu');
      const userLabel = document.getElementById('auth-dropdown-user');
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      if (userLabel) userLabel.textContent = data.user.username;
    } catch (err) {
      errorEl.textContent = 'Network error';
    }
  };

  window.toggleUserMenu = function() {
    const dropdown = document.getElementById('auth-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.auth-user-menu')) {
          dropdown.classList.remove('show');
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  };

  window.authLogout = function() {
    localStorage.removeItem('agenthub-token');
    localStorage.removeItem('agenthub-user');
    const loginBtn = document.getElementById('auth-login-btn');
    const userMenu = document.getElementById('auth-user-menu');
    if (loginBtn) loginBtn.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
    document.getElementById('auth-dropdown').classList.remove('show');
  };

  window.showTokensModal = function() {
    alert('Token: ' + (localStorage.getItem('agenthub-token') || 'Not logged in'));
  };
})();
</script>
`;

function page(title, body, options = {}) {
  const {
    description = "AgentHub - Discover open source AI Agents for your workflow. Install to your assistant in one click. Publish, version and share your Agent capabilities.",
    url = "https://agenthub.cyou/",
    type = "website",
    image = "https://agenthub.cyou/og-image.png"
  } = options;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>

  <!-- SEO Meta -->
  <meta name="description" content="${description}">
  <meta name="keywords" content="AI Agent, AgentHub, OpenClaw, AI marketplace, agent packaging, artificial intelligence, open source">
  <meta name="author" content="AgentHub Team">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:site_name" content="AgentHub">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="zh_CN">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AgentHub",
    "url": "https://agenthub.cyou/",
    "description": "${description.replace(/"/g, '\\"')}",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://agenthub.cyou/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>

  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦀</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Light theme (default) - Vibrant Sunset palette */
    :root {
      --color-1: #fd63a3;
      --color-2: #fe9800;
      --color-3: #ffb74d;
      --font-display: 'Plus Jakarta Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-body: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      --bg-primary: #fffbf7;
      --bg-secondary: #fff5ed;
      --bg-card: #ffffff;
      --bg-card-hover: #fff8f3;
      --bg-code: #fff9f5;
      --text-primary: #2d1810;
      --text-secondary: #6b4a3a;
      --text-muted: #a08070;
      --accent: #fa709a;
      --accent-light: #ff9a8b;
      --accent-dark: #e85a80;
      --accent-glow: rgba(250, 112, 154, 0.12);
      --border: #f0d8c8;
      --header-bg: rgba(255, 251, 247, 0.95);
      --tag-ops: #fa709a;
      --tag-engineering: #ff9a8b;
      --tag-content: #fee140;
      --tag-product: #f5a623;
    }

    /* Dark theme - Vibrant sunset tones */
    [data-theme="dark"] {
      --color-1: #fd63a3;
      --color-2: #fe9800;
      --color-3: #ffb74d;
      --bg-primary: #1a1215;
      --bg-secondary: #251a1d;
      --bg-card: #2a1f22;
      --bg-card-hover: #352528;
      --bg-code: #251a1d;
      --text-primary: #fff5f0;
      --text-secondary: #d4b8a8;
      --text-muted: #8a7060;
      --accent: #ff9a8b;
      --accent-light: #ffb8a8;
      --accent-dark: #fa709a;
      --accent-glow: rgba(255, 154, 139, 0.15);
      --border: #3d2a28;
      --header-bg: rgba(26, 18, 21, 0.95);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Subtle background texture */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: -1;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Scroll reveal */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    a { color: inherit; text-decoration: none; }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Header - ClawHub inspired minimal style */
    header {
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      position: sticky;
      top: 0;
      background: var(--header-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 100;
      animation: fadeIn 0.5s ease-out;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
      transition: all 0.3s ease;
    }
    .logo:hover {
      transform: translateX(2px);
    }
    .logo-icon {
      font-size: 28px;
      filter: drop-shadow(0 2px 4px rgba(250, 112, 154, 0.3));
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .logo:hover .logo-icon {
      transform: rotate(-10deg) scale(1.1);
    }
    .logo-tagline {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      font-family: var(--font-body);
      letter-spacing: 0.02em;
      margin-top: 2px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .nav-links a {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      transition: color 0.2s;
      position: relative;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3));
      transition: width 0.25s ease;
      border-radius: 1px;
    }
    .nav-links a:hover {
      color: var(--text-primary);
    }
    .nav-links a:hover::after {
      width: 100%;
    }
    .nav-powered {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--bg-secondary);
      border-radius: 8px;
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--font-display);
    }
    .nav-powered a {
      color: var(--color-1);
      font-weight: 600;
    }
    .nav-powered a::after {
      display: none;
    }

    /* Language Switcher - Coral themed */
    .lang-switcher {
      display: flex;
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }
    .lang-btn {
      padding: 6px 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-display);
      transition: all 0.2s;
    }
    .lang-btn:hover {
      color: var(--text-primary);
    }
    .lang-btn.active {
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #ffffff;
    }

    /* Theme Switcher - Coral themed */
    .theme-btn {
      background: var(--bg-secondary);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
      margin-left: 6px;
    }
    .theme-btn:hover {
      background: var(--bg-card-hover);
      transform: scale(1.05);
    }
    .theme-btn:active {
      transform: scale(0.95);
    }

    /* Hero - Sunset gradient style */
    .hero {
      text-align: center;
      padding: 80px 20px 64px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 600px;
      background: radial-gradient(ellipse at center, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.06) 30%, rgba(255, 183, 77, 0.04) 50%, transparent 70%);
      pointer-events: none;
      z-index: -1;
      animation: pulse 6s ease-in-out infinite;
    }
    .hero::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      background: conic-gradient(from 0deg, transparent, rgba(250, 112, 154, 0.04), transparent, rgba(254, 152, 0, 0.04), transparent);
      border-radius: 50%;
      animation: spin 20s linear infinite;
      pointer-events: none;
      z-index: -1;
    }
    @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(42px, 8vw, 72px);
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--color-1) 0%, var(--color-3) 40%, var(--color-2) 70%, var(--color-1) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeInUp 0.6s ease-out, gradientShift 6s ease infinite;
    }
    .hero-subtitle {
      font-size: 18px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto 48px;
      line-height: 1.8;
      animation: fadeInUp 0.6s ease-out 0.1s backwards;
    }
    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-bottom: 48px;
      animation: fadeInUp 0.6s ease-out 0.2s backwards;
    }
    .hero-stat {
      text-align: center;
      padding: 16px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      transition: all 0.3s ease;
      min-width: 140px;
    }
    .hero-stat:hover {
      border-color: var(--color-1);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.1);
    }
    .hero-stat-value {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }
    .hero-stat-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
      margin-top: 6px;
    }

    /* Features - Warm coral accents */
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-bottom: 56px;
    }
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
      opacity: 0;
      transition: opacity 0.3s;
    }
    .feature-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(250, 112, 154, 0.03), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .feature-card:hover {
      border-color: var(--color-1);
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(250, 112, 154, 0.12);
    }
    .feature-card:hover::before {
      opacity: 1;
    }
    .feature-card:hover::after {
      opacity: 1;
    }
    .feature-icon {
      font-size: 36px;
      margin-bottom: 16px;
      display: block;
      animation: float 3s ease-in-out infinite;
    }
    .feature-card:nth-child(2) .feature-icon { animation-delay: 0.5s; }
    .feature-card:nth-child(3) .feature-icon { animation-delay: 1s; }
    .feature-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
      color: var(--text-primary);
    }
    .feature-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    /* Section - Coral themed */
    .section {
      margin-bottom: 56px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .section-link {
      color: var(--color-1);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s;
    }
    .section-link:hover {
      gap: 10px;
      color: var(--color-3);
    }

    /* Agent Grid - Coral themed */
    .agent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
      transition: all 0.3s ease;
    }
    .agent-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      animation: fadeInUp 0.5s ease-out backwards;
      position: relative;
      overflow: hidden;
    }
    .agent-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
      transform: scaleX(0);
      transition: transform 0.3s ease;
      transform-origin: left;
    }
    .agent-card:nth-child(1) { animation-delay: 0.05s; }
    .agent-card:nth-child(2) { animation-delay: 0.1s; }
    .agent-card:nth-child(3) { animation-delay: 0.15s; }
    .agent-card:nth-child(4) { animation-delay: 0.2s; }
    .agent-card:nth-child(5) { animation-delay: 0.25s; }
    .agent-card:nth-child(6) { animation-delay: 0.3s; }
    .agent-card:nth-child(7) { animation-delay: 0.35s; }
    .agent-card:nth-child(8) { animation-delay: 0.4s; }
    .agent-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--color-1);
      transform: translateY(-6px);
      box-shadow: 0 20px 48px rgba(250, 112, 154, 0.15);
    }
    .agent-card:hover::after {
      transform: scaleX(1);
    }
    .agent-card-featured {
      border-color: var(--color-1);
      background: linear-gradient(135deg, rgba(250, 112, 154, 0.03), rgba(255, 154, 139, 0.03));
    }
    .agent-card-featured:hover {
      box-shadow: 0 16px 40px rgba(250, 112, 154, 0.25);
    }
    .featured-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(250, 112, 154, 0.3);
    }
    .agent-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .agent-name {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.01em;
      transition: color 0.2s;
    }
    .agent-card:hover .agent-name {
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .agent-version {
      background: linear-gradient(135deg, rgba(250, 112, 154, 0.12), rgba(255, 154, 139, 0.12));
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-family: var(--font-display);
      color: var(--color-1);
      font-weight: 600;
    }
    .agent-desc {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 14px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .agent-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .agent-tag {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      font-family: var(--font-display);
    }
    .tag-ops { background: rgba(250, 112, 154, 0.12); color: var(--color-1); }
    .tag-engineering { background: rgba(255, 154, 139, 0.12); color: var(--color-3); }
    .tag-content { background: rgba(254, 225, 64, 0.15); color: #c9a800; }
    .tag-product { background: rgba(245, 166, 35, 0.12); color: #e09000; }
    .tag-default { background: var(--bg-secondary); color: var(--text-muted); }
    .agent-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .agent-downloads {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-size: 13px;
    }
    .agent-install {
      background: linear-gradient(135deg, var(--color-1) 0%, var(--color-3) 100%);
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 12px;
      font-family: var(--font-display);
      font-weight: 600;
      transition: all 0.25s;
      box-shadow: 0 4px 12px rgba(250, 112, 154, 0.25);
    }
    .agent-install:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(250, 112, 154, 0.35);
    }
    .agent-install:active {
      transform: translateY(0);
    }

    /* API Box - Sunset gradient accent */
    .api-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 56px;
      position: relative;
      overflow: hidden;
    }
    .api-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
    }
    .api-box h3 {
      font-family: var(--font-display);
      font-size: 16px;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }
    .api-box p {
      color: var(--text-secondary);
      margin-bottom: 20px;
      font-size: 14px;
    }
    .api-code {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px 20px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--color-1);
      overflow-x: auto;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      transition: all 0.25s;
    }
    .api-code:hover {
      border-color: var(--color-1);
      background: var(--bg-secondary);
    }
    .api-code .code-text {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .api-code .code-text::before {
      content: '$';
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .api-code .copy-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 12px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .api-code .copy-btn:hover {
      background: var(--color-1);
      color: white;
      border-color: var(--color-1);
    }
    .api-code .copy-btn.copied {
      background: var(--color-2);
      border-color: var(--color-2);
      color: #2d1810;
    }

    /* Detail Page - Coral themed */
    .detail-header {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 36px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }
    .detail-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
    }
    .detail-title {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .detail-desc {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.7;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .detail-item {
      background: var(--bg-secondary);
      padding: 18px;
      border-radius: 12px;
      border: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .detail-item:hover {
      border-color: var(--border);
    }
    .detail-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .detail-value {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .detail-install {
      background: var(--bg-code);
      border: 1px solid var(--border);
      color: var(--color-1);
      padding: 16px 20px;
      border-radius: 12px;
      font-family: var(--font-mono);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.25s;
    }
    .detail-install:hover {
      border-color: var(--color-1);
      background: var(--bg-secondary);
    }
    .detail-install .code-text {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .detail-install .code-text::before {
      content: "$";
      color: var(--text-muted);
      font-weight: bold;
    }
    .detail-install .copy-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .detail-install .copy-btn:hover {
      background: var(--color-1);
      color: white;
      border-color: var(--color-1);
    }
    .detail-install .copy-btn.copied {
      background: var(--color-2);
      border-color: var(--color-2);
      color: #2d1810;
    }
    .install-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .install-methods {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .install-box {
      position: relative;
    }
    .install-box.primary .detail-install {
      border-color: var(--color-1);
      background: linear-gradient(135deg, rgba(250, 112, 154, 0.06), transparent);
    }
    .install-box .badge-new {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: white;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Install Environment Tabs */
    .install-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      background: var(--bg-secondary);
      border-radius: 10px;
      padding: 4px;
    }
    .install-tab {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .install-tab:hover {
      color: var(--text-primary);
      background: var(--bg-card);
    }
    .install-tab.active {
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(250, 112, 154, 0.25);
    }
    .install-tab-content {
      display: none;
    }
    .install-tab-content.active {
      display: block;
    }
    .install-sub-section {
      margin-top: 12px;
    }
    .install-sub-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .install-sub-value {
      font-family: var(--font-display);
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .install-sub-value:hover {
      border-color: var(--color-1);
    }

    /* Permission Card */
    .perm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
      margin-bottom: 16px;
    }
    .perm-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--bg-secondary);
      border-radius: 10px;
      font-size: 13px;
      transition: background 0.2s;
    }
    .perm-item:hover {
      background: var(--bg-card-hover);
    }
    .perm-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    .perm-status {
      margin-left: auto;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .perm-yes {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }
    .perm-no {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }
    .risk-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
    }
    .risk-low {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }
    .risk-medium {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }
    .risk-high {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    /* Trust Badges */
    .trust-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .trust-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-display);
    }
    .trust-badge-positive {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .trust-badge-warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .trust-badge-danger {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .trust-badge-info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    /* Compatibility */
    .compat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .compat-item {
      padding: 14px;
      background: var(--bg-secondary);
      border-radius: 10px;
    }
    .compat-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .compat-value {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 500;
    }
    .compat-platforms {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .compat-platforms .badge {
      padding: 4px 10px;
      font-size: 11px;
    }
    .compat-limitations {
      margin-top: 12px;
      list-style: none;
    }
    .compat-limitations li {
      padding: 6px 0;
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .compat-limitations li::before {
      content: '⚠️';
      font-size: 12px;
    }

    /* Use Cases */
    .usecase-section {
      margin-bottom: 14px;
    }
    .usecase-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .usecase-content {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.7;
    }
    .usecase-list {
      list-style: none;
    }
    .usecase-list li {
      padding: 6px 0;
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .usecase-list.positive li::before {
      content: '✅';
      flex-shrink: 0;
    }
    .usecase-list.negative li::before {
      content: '❌';
      flex-shrink: 0;
    }

    /* Usage Examples */
    .example-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .example-card:hover {
      border-color: var(--color-1);
    }
    .example-prompt {
      font-family: var(--font-display);
      font-size: 13px;
      color: var(--color-1);
      background: var(--bg-code);
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .example-prompt::before {
      content: '💬 ';
    }
    .example-result {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      padding-left: 4px;
    }
    .example-result::before {
      content: '→ ';
      color: var(--text-muted);
    }

    /* Hero CTA Buttons */
    .hero-ctas {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 48px;
      animation: fadeInUp 0.6s ease-out 0.15s backwards;
      flex-wrap: wrap;
    }
    .hero-cta {
      padding: 14px 28px;
      border-radius: 12px;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .hero-cta-primary {
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(250, 112, 154, 0.3);
      border: none;
    }
    .hero-cta-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 32px rgba(250, 112, 154, 0.4);
    }
    .hero-cta-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 2px solid var(--border);
    }
    .hero-cta-secondary:hover {
      border-color: var(--color-1);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.12);
    }
    .hero-cta-outline {
      background: transparent;
      color: var(--color-1);
      border: 2px solid var(--color-1);
    }
    .hero-cta-outline:hover {
      background: var(--accent-glow);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.15);
    }

    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 26px;
      margin-bottom: 20px;
      transition: border-color 0.25s;
    }
    .section-card:hover {
      border-color: var(--border);
    }
    .section-card h3 {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.01em;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      font-size: 14px;
      transition: all 0.25s;
    }
    .back-link:hover {
      color: var(--color-1);
      gap: 12px;
    }

    /* Memory bars - Coral themed */
    .memory-bars {
      display: flex;
      gap: 3px;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .memory-bar { height: 100%; }
    .memory-bar.public { background: var(--color-1); }
    .memory-bar.portable { background: var(--color-3); }
    .memory-bar.private { background: var(--color-2); }
    .memory-legend {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .memory-legend span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .memory-legend .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* Skills & Tags - Coral themed */
    .skills-list, .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-family: var(--font-display);
      font-weight: 600;
    }
    .badge-skill { background: rgba(250, 112, 154, 0.12); color: var(--color-1); }
    .badge-tag { background: rgba(254, 225, 64, 0.15); color: #b89800; }

    /* Requirements - Coral themed */
    .requirements-list {
      list-style: none;
    }
    .requirements-list li {
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .requirements-list li:last-child {
      border-bottom: none;
    }
    .env-var {
      font-family: var(--font-display);
      background: linear-gradient(135deg, rgba(250, 112, 154, 0.1), rgba(255, 154, 139, 0.1));
      padding: 4px 10px;
      border-radius: 6px;
      color: var(--color-1);
      font-size: 12px;
      font-weight: 500;
    }

    /* Stats Page - Coral themed */
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .stats-table th, .stats-table td {
      padding: 16px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .stats-table th {
      font-family: var(--font-display);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .stats-table a {
      color: var(--color-1);
      font-family: var(--font-display);
      font-weight: 500;
    }
    .stats-table a:hover {
      text-decoration: underline;
    }

    /* How it works - Coral themed */
    .how-it-works {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      margin-bottom: 56px;
      position: relative;
    }
    .how-it-works::before {
      content: '';
      position: absolute;
      top: 36px;
      left: 16%;
      right: 16%;
      height: 2px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
      opacity: 0.2;
      z-index: 0;
    }
    .step {
      text-align: center;
      position: relative;
      z-index: 1;
    }
    .step-number {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--color-1) 0%, var(--color-3) 100%);
      color: #ffffff;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      margin: 0 auto 18px;
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.25);
      transition: all 0.3s ease;
    }
    .step:hover .step-number {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 12px 32px rgba(250, 112, 154, 0.35);
    }
    .step h4 {
      font-family: var(--font-display);
      font-size: 15px;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }
    .step p {
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.6;
    }

    /* Category filter tabs */
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
      justify-content: center;
    }
    .category-tab {
      padding: 8px 18px;
      border-radius: 24px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font-display);
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .category-tab:hover {
      border-color: var(--color-1);
      color: var(--color-1);
      background: var(--accent-glow);
    }
    .category-tab.active {
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(250, 112, 154, 0.25);
    }
    .category-tab .count {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 1px 7px;
      border-radius: 10px;
      font-size: 11px;
      margin-left: 4px;
    }
    .category-tab.active .count {
      background: rgba(255,255,255,0.3);
    }
    .category-tab:not(.active) .count {
      background: var(--bg-secondary);
    }

    /* Load more */
    .load-more-wrap {
      text-align: center;
      margin-top: 28px;
    }
    .load-more-btn {
      padding: 12px 36px;
      border-radius: 12px;
      border: 2px solid var(--border);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font-display);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .load-more-btn:hover {
      border-color: var(--color-1);
      color: var(--color-1);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(250, 112, 154, 0.12);
    }
    .load-more-btn:active {
      transform: translateY(0);
    }
    .agent-card.hidden {
      display: none;
    }

    /* Auth Nav */
    .auth-nav { display: flex; align-items: center; gap: 8px; margin-left: 8px; }
    .auth-login-btn {
      padding: 8px 20px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #fff; font-size: 13px; font-weight: 600; font-family: var(--font-display);
      cursor: pointer; transition: all 0.25s;
    }
    .auth-login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(250,112,154,0.3); }
    .auth-avatar-btn {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border);
      background: var(--bg-secondary); font-size: 18px; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .auth-avatar-btn:hover { border-color: var(--color-1); transform: scale(1.05); }
    .auth-user-menu { position: relative; }
    .auth-dropdown {
      display: none; position: absolute; top: 44px; right: 0; min-width: 180px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.12); z-index: 200; overflow: hidden;
    }
    .auth-dropdown.show { display: block; animation: fadeInUp 0.2s ease-out; }
    .auth-dropdown-user { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 13px; font-weight: 600; }
    .auth-dropdown a {
      display: block; padding: 10px 16px; font-size: 13px; color: var(--text-secondary); transition: background 0.15s;
    }
    .auth-dropdown a:hover { background: var(--bg-secondary); color: var(--text-primary); }
    .auth-logout { color: var(--color-1) !important; }

    /* Auth Modal */
    .auth-modal-overlay {
      display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
      align-items: center; justify-content: center; backdrop-filter: blur(4px);
    }
    .auth-modal-overlay.show { display: flex; animation: fadeIn 0.2s; }
    .auth-modal {
      background: var(--bg-card); border-radius: 20px; width: 100%; max-width: 400px;
      padding: 36px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); animation: fadeInUp 0.3s ease-out;
    }
    .auth-modal h2 { font-family: var(--font-display); font-size: 22px; text-align: center; margin-bottom: 24px; }
    .auth-modal-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--bg-secondary); border-radius: 10px; padding: 3px; }
    .auth-modal-tab {
      flex: 1; padding: 10px; border: none; background: transparent; border-radius: 8px;
      font-family: var(--font-display); font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text-muted); transition: all 0.2s;
    }
    .auth-modal-tab.active { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .auth-input {
      width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; font-family: var(--font-body);
      margin-bottom: 12px; transition: border-color 0.2s; outline: none;
    }
    .auth-input:focus { border-color: var(--color-1); }
    .auth-submit {
      width: 100%; padding: 13px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #fff; font-size: 14px; font-weight: 600; font-family: var(--font-display);
      cursor: pointer; transition: all 0.25s; margin-top: 4px;
    }
    .auth-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(250,112,154,0.3); }
    .auth-divider { text-align: center; color: var(--text-muted); font-size: 12px; margin: 20px 0; position: relative; }
    .auth-divider::before, .auth-divider::after {
      content: ''; position: absolute; top: 50%; width: 35%; height: 1px; background: var(--border);
    }
    .auth-divider::before { left: 0; }
    .auth-divider::after { right: 0; }
    .auth-oauth-btns { display: flex; gap: 10px; }
    .auth-oauth-btn {
      flex: 1; padding: 11px; border: 1px solid var(--border); border-radius: 10px;
      background: var(--bg-secondary); color: var(--text-primary); font-size: 13px; font-weight: 600;
      font-family: var(--font-display); cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none;
    }
    .auth-oauth-btn:hover { border-color: var(--color-1); transform: translateY(-1px); }
    .auth-oauth-btn svg { width: 18px; height: 18px; }
    .auth-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-muted); }
    .auth-error { color: #e53e3e; font-size: 12px; margin-bottom: 10px; text-align: center; min-height: 16px; }

    /* Trust Badges on cards */
    .agent-trust-badges { display: flex; gap: 6px; margin-bottom: 10px; }
    .trust-badge {
      font-size: 14px; display: inline-flex; align-items: center;
      opacity: 0.7; transition: opacity 0.2s;
    }
    .trust-badge:hover { opacity: 1; }

    /* Card-level Trust Badges (Task 7.2) */
    .agent-card .card-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 12px;
    }
    .card-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-display);
      line-height: 1.4;
    }
    .card-badge-positive { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .card-badge-warning  { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .card-badge-danger   { background: rgba(239, 68, 68, 0.1);  color: #ef4444; }
    .card-badge-info     { background: rgba(59, 130, 246, 0.1);  color: #3b82f6; }

    /* Showcase Module (Tasks 8.1-8.3) */
    .showcase-section {
      margin-bottom: 40px;
    }
    .showcase-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .showcase-title {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .showcase-scroll {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding-bottom: 8px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    .showcase-scroll::-webkit-scrollbar {
      height: 4px;
    }
    .showcase-scroll::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: 2px;
    }
    .showcase-scroll::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }
    .showcase-scroll .agent-card {
      min-width: 280px;
      max-width: 320px;
      flex-shrink: 0;
      scroll-snap-align: start;
      display: block;
    }
    .showcase-empty {
      color: var(--text-muted);
      font-size: 13px;
      padding: 24px;
      text-align: center;
      background: var(--bg-secondary);
      border-radius: 12px;
      width: 100%;
    }

    /* Getting Started Guide (Task 8.4) */
    .getting-started {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 40px;
      position: relative;
      overflow: hidden;
    }
    .getting-started::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2));
    }
    .getting-started h3 {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .getting-started .gs-desc {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 20px;
    }
    .getting-started .gs-steps {
      list-style: none;
      counter-reset: gs-counter;
    }
    .getting-started .gs-steps li {
      counter-increment: gs-counter;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 0;
      font-size: 14px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
    }
    .getting-started .gs-steps li:last-child {
      border-bottom: none;
    }
    .getting-started .gs-steps li::before {
      content: counter(gs-counter);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      min-width: 28px;
      background: linear-gradient(135deg, var(--color-1), var(--color-3));
      color: #fff;
      border-radius: 50%;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 700;
    }
    .getting-started .gs-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 18px;
      color: var(--color-1);
      font-weight: 600;
      font-size: 14px;
      transition: gap 0.2s;
    }
    .getting-started .gs-link:hover {
      gap: 10px;
    }

    /* No results */
    .no-results {
      text-align: center;
      padding: 48px 20px;
      color: var(--text-muted);
      display: none;
    }
    .no-results.show {
      display: block;
    }
    .no-results-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    /* Search - Coral themed */
    .search-box {
      display: flex;
      background: var(--bg-card);
      border: 2px solid var(--border);
      border-radius: 14px;
      padding: 6px;
      max-width: 520px;
      margin: 0 auto 36px;
      transition: all 0.3s ease;
    }
    .search-box:focus-within {
      border-color: var(--color-1);
      box-shadow: 0 0 0 4px rgba(250, 112, 154, 0.1);
    }
    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 12px 16px;
      font-size: 15px;
      font-family: var(--font-body);
      color: var(--text-primary);
      outline: none;
    }
    .search-box input::placeholder {
      color: var(--text-muted);
    }
    .search-box button {
      background: linear-gradient(135deg, var(--color-1) 0%, var(--color-3) 100%);
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s;
    }
    .search-box button:hover {
      box-shadow: 0 4px 16px rgba(250, 112, 154, 0.3);
    }
    .search-box button:active {
      transform: scale(0.97);
    }

    /* Empty state - Coral themed */
    .empty-state {
      text-align: center;
      padding: 56px 20px;
      color: var(--text-muted);
    }
    .empty-state h3 {
      font-family: var(--font-display);
      font-size: 18px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }
    .empty-state p {
      font-size: 14px;
    }
    .empty-state code {
      background: var(--bg-secondary);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: var(--font-display);
      font-size: 13px;
      color: var(--color-1);
    }

    /* Footer - Coral themed */
    footer {
      border-top: 1px solid var(--border);
      padding: 48px 0;
      margin-top: 80px;
      background: var(--bg-secondary);
      position: relative;
    }
    footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-1), var(--color-3), var(--color-2), var(--color-1));
      background-size: 200% auto;
      animation: gradientShift 4s linear infinite;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-brand-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: var(--accent-glow);
      border-radius: 10px;
    }
    .footer-brand-text {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary);
    }
    .footer-powered {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .footer-powered a {
      color: var(--color-1);
      font-weight: 600;
      transition: color 0.2s;
    }
    .footer-powered a:hover {
      color: var(--color-3);
    }
    .footer-links {
      display: flex;
      gap: 24px;
    }
    .footer-links a {
      color: var(--text-secondary);
      font-size: 13px;
      font-family: var(--font-display);
      font-weight: 500;
      transition: all 0.2s;
    }
    .footer-links a:hover {
      color: var(--color-1);
    }

    @media (max-width: 768px) {
      .hero { padding: 48px 16px 40px; }
      .hero h1 { font-size: clamp(32px, 7vw, 44px); }
      .hero-subtitle { font-size: 15px; padding: 0 12px; }
      .hero-stats { gap: 16px; flex-wrap: wrap; }
      .hero-stat { min-width: 100px; padding: 12px 16px; }
      .hero-stat-value { font-size: 28px; }
      .features { grid-template-columns: 1fr; gap: 14px; }
      .how-it-works { grid-template-columns: 1fr; gap: 24px; }
      .how-it-works::before { display: none; }
      .detail-grid { grid-template-columns: repeat(2, 1fr); }
      .agent-grid { grid-template-columns: 1fr; }
      .footer-content { flex-direction: column; text-align: center; gap: 20px; }

      /* Mobile navigation */
      .header-content { flex-wrap: wrap; gap: 12px; }
      .nav-links {
        order: 3;
        width: 100%;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .nav-links a { font-size: 13px; }
      .nav-powered { display: none; }
      .logo { font-size: 18px; }
      .logo-icon { font-size: 24px; }
      .logo-tagline { font-size: 10px; }
      .container { padding: 0 16px; }
      .detail-header { padding: 24px; }
      .detail-title { font-size: 26px; }
      .section-card { padding: 20px; }
      .search-box { margin: 0 0 28px; }
      .api-box { padding: 24px; }
      .api-code { font-size: 12px; padding: 14px 16px; }
      .stats-table th, .stats-table td { padding: 12px 10px; font-size: 13px; }
      .step-number { width: 42px; height: 42px; font-size: 16px; }
      .step h4 { font-size: 14px; }
      .category-filters { gap: 6px; }
      .category-tab { padding: 6px 14px; font-size: 12px; }
    }

    @media (max-width: 480px) {
      .theme-btn { width: 32px; height: 32px; font-size: 14px; }
      .hero-stat-value { font-size: 24px; }
      .hero-stat-label { font-size: 10px; }
      .hero-stats { gap: 10px; }
      .hero-stat { min-width: 80px; padding: 10px 12px; }
      .nav-links { gap: 12px; }
      .nav-links a { font-size: 12px; }
      .section-title { font-size: 18px; }
      .feature-card { padding: 22px 18px; }
      .feature-icon { font-size: 28px; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-content">
      <a href="/" class="logo">
        <span class="logo-icon">🦀</span>
        <div>
          <div>AgentHub</div>
          <div class="logo-tagline">Crab-powered. Agent-ready.</div>
        </div>
      </a>
      <nav class="nav-links">
        <a href="/"><span data-i18n="navHome">Home</span></a>
        <a href="/stats"><span data-i18n="navStats">Stats</span></a>
        <a href="https://github.com/itshaungmu/AgentHub" target="_blank">GitHub</a>
        <div class="nav-powered">
          <span>🦀</span>
          <span>Powered by</span>
          <a href="https://github.com/openclaw" target="_blank">OpenClaw</a>
        </div>
        <div class="lang-switcher">
          <button class="lang-btn active" data-lang="en" onclick="setLang('en')">EN</button>
          <button class="lang-btn" data-lang="zh" onclick="setLang('zh')">中文</button>
        </div>
        <button class="theme-btn" onclick="toggleTheme()" aria-label="Switch theme">🌙</button>
        <div class="auth-nav" id="auth-nav">
          <button class="auth-login-btn" id="auth-login-btn" onclick="showAuthModal()" data-i18n="authLogin">Login</button>
          <div class="auth-user-menu" id="auth-user-menu" style="display:none">
            <button class="auth-avatar-btn" id="auth-avatar-btn" onclick="toggleUserMenu()">👤</button>
            <div class="auth-dropdown" id="auth-dropdown">
              <div class="auth-dropdown-user" id="auth-dropdown-user"></div>
              <a href="javascript:void(0)" onclick="showTokensModal()" data-i18n="authMyTokens">My Tokens</a>
              <a href="javascript:void(0)" onclick="authLogout()" class="auth-logout" data-i18n="authLogout">Logout</a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
  <main class="container">${body}</main>
  <footer>
    <div class="container footer-content">
      <div class="footer-brand">
        <div class="footer-brand-icon">🦀</div>
        <span class="footer-brand-text">AgentHub</span>
      </div>
      <div class="footer-powered">
        <span>Powered by</span>
        <a href="https://github.com/openclaw" target="_blank">OpenClaw</a>
        <span>•</span>
        <span>Built with ❤️ for AI Agents</span>
      </div>
      <div class="footer-links">
        <a href="https://github.com/openclaw" target="_blank">OpenClaw</a>
        <a href="https://github.com/itshaungmu/AgentHub" target="_blank">AgentHub</a>
      </div>
    </div>
  </footer>
  <!-- Auth Modal -->
  <div class="auth-modal-overlay" id="auth-modal-overlay" onclick="if(event.target===this)hideAuthModal()">
    <div class="auth-modal" style="position:relative">
      <button class="auth-close" onclick="hideAuthModal()">&times;</button>
      <h2>🦀 AgentHub</h2>
      <div class="auth-modal-tabs">
        <button class="auth-modal-tab active" onclick="switchAuthTab('login')" id="tab-login" data-i18n="authLogin">Login</button>
        <button class="auth-modal-tab" onclick="switchAuthTab('register')" id="tab-register" data-i18n="authRegister">Register</button>
      </div>
      <div class="auth-error" id="auth-error"></div>
      <form id="auth-form" onsubmit="handleAuthSubmit(event)">
        <input class="auth-input" id="auth-username" type="text" required autocomplete="username">
        <input class="auth-input" id="auth-password" type="password" required autocomplete="current-password">
        <input class="auth-input" id="auth-email" type="email" style="display:none" autocomplete="email">
        <button class="auth-submit" type="submit" id="auth-submit-btn" data-i18n="authLogin">Login</button>
      </form>
      <div class="auth-divider" data-i18n="authOrDivider">or continue with</div>
      <div class="auth-oauth-btns" id="auth-oauth-btns">
        <a class="auth-oauth-btn" href="/api/auth/oauth/github" id="oauth-github">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
        <a class="auth-oauth-btn" href="/api/auth/oauth/google" id="oauth-google">
          <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </a>
      </div>
    </div>
  </div>
</body>
</html>
${langScript}`;
}

export function renderAgentListPage({ query, agents, totalDownloads, apiBase }) {
  const agentCount = agents.length;

  // Count agents per category
  const categoryCounts = {};
  agents.forEach(a => {
    const cat = a.metadata?.category || 'default';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const features = `
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">📦</div>
        <div class="feature-title" data-i18n="feature1Title">Ready to Use</div>
        <div class="feature-desc" data-i18n="feature1Desc">Skip complex configurations, get battle-tested AI Agent setups</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-title" data-i18n="feature2Title">Instant Deploy</div>
        <div class="feature-desc" data-i18n="feature2Desc">One-click install, deploy in minutes, start working immediately</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <div class="feature-title" data-i18n="feature3Title">Version Control</div>
        <div class="feature-desc" data-i18n="feature3Desc">Automatic version upgrades, always stay with the latest capabilities</div>
      </div>
    </div>
  `;

  // === Reusable card renderer (with trust badges — Task 7.2) ===
  function renderCard(agent, extraClass = '') {
    const tags = agent.metadata?.tags || [];
    const category = agent.metadata?.category || 'default';
    const featured = agent.metadata?.featured;
    const badges = getTrustBadges(agent);

    const tagClass = {
      'ops': 'tag-ops',
      'engineering': 'tag-engineering',
      'content': 'tag-content',
      'product': 'tag-product'
    }[category] || 'tag-default';

    const badgesHtml = badges.length > 0
      ? `<div class="card-badges">${badges.slice(0, 3).map(b =>
          `<span class="card-badge card-badge-${b.type}">${b.icon} ${b.label}</span>`
        ).join('')}</div>`
      : '';

    return `
      <article class="agent-card${extraClass ? ' ' + extraClass : ''}" data-category="${category}" onclick="window.location='/agents/${agent.slug}'">
        ${featured ? '<span class="featured-badge">⭐</span>' : ''}
        <div class="agent-header">
          <a href="/agents/${agent.slug}" class="agent-name" onclick="event.stopPropagation()">${agent.name || agent.slug}</a>
          <span class="agent-version">v${agent.version}</span>
        </div>
        <p class="agent-desc">${agent.description || 'A powerful AI Agent'}</p>
        ${badgesHtml}
        <div class="agent-meta">
          <span class="agent-tag ${tagClass}">${category}</span>
          ${tags.slice(0, 2).map(t => `<span class="agent-tag tag-default">${t}</span>`).join('')}
        </div>
        <div class="agent-trust-badges">
          ${agent.privacyVerified !== false ? '<span class="trust-badge trust-privacy" title="Privacy Verified">🛡️</span>' : ''}
          ${agent.signed ? '<span class="trust-badge trust-signed" title="Signed Bundle">✅</span>' : ''}
        </div>
        <div class="agent-footer">
          <span class="agent-downloads">
            <span>⬇️</span> ${agent.downloads || 0} <span data-i18n="downloads">downloads</span>
          </span>
          <span class="agent-install" data-i18n="install">Install</span>
        </div>
      </article>
    `;
  }

  // Main grid cards (with hidden class for pagination)
  const cards = agents.map(agent => renderCard(agent, 'hidden')).join('');

  // === Showcase modules (Tasks 8.1-8.3) ===

  // 8.1: Recently Updated — sort by bundleVersion or version, take top 6
  const recentlyUpdated = [...agents]
    .sort((a, b) => (b.version || '').localeCompare(a.version || ''))
    .slice(0, 6);

  // 8.2: Zero Config — no API key, no env vars, no shell
  const zeroConfig = agents.filter(a => {
    const perms = a.permissions || {};
    const env = a.requirements?.env || [];
    return !perms.requiresApiKey && !perms.executeShell && env.length === 0;
  }).slice(0, 6);

  // 8.3: Verified — has repository URL (verified source badge)
  const verified = agents.filter(a => a.metadata?.repository).slice(0, 6);

  function renderShowcase(i18nKey, defaultTitle, agentList) {
    if (agentList.length === 0) return '';
    return `
    <div class="showcase-section reveal">
      <div class="showcase-header">
        <h3 class="showcase-title" data-i18n="${i18nKey}">${defaultTitle}</h3>
      </div>
      <div class="showcase-scroll">
        ${agentList.map(a => renderCard(a)).join('')}
      </div>
    </div>`;
  }

  const showcaseModules = [
    renderShowcase('sectionRecentlyUpdated', '🕐 Recently Updated', recentlyUpdated),
    renderShowcase('sectionZeroConfig', '🟢 Zero Config — Ready to Go', zeroConfig),
    renderShowcase('sectionVerified', '✅ Verified Agents', verified),
  ].join('');

  // 8.4: Getting Started Guide
  const gettingStarted = `
    <div class="getting-started reveal">
      <h3 data-i18n="sectionGettingStarted">🚀 Getting Started</h3>
      <p class="gs-desc" data-i18n="gettingStartedDesc">New to AgentHub? Here's how to get started in 3 minutes.</p>
      <ol class="gs-steps">
        <li data-i18n="gettingStartedStep1">Install Node.js 18+ on your machine</li>
        <li data-i18n="gettingStartedStep2">Browse agents above and find one you like</li>
        <li data-i18n="gettingStartedStep3">Run the install command in your workspace</li>
        <li data-i18n="gettingStartedStep4">Start chatting with your AI assistant — the agent skills are ready!</li>
      </ol>
      <a href="https://github.com/itshaungmu/AgentHub#readme" target="_blank" class="gs-link" data-i18n="gettingStartedDocs">Read Full Documentation →</a>
    </div>`;

  // Category filter tabs
  const categoryFilters = `
    <div class="category-filters">
      <button class="category-tab active" data-category="all">All<span class="count">${agentCount}</span></button>
      ${Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
        return `<button class="category-tab" data-category="${cat}">${cat}<span class="count">${count}</span></button>`;
      }).join('')}
    </div>
  `;

  const howItWorks = `
    <div class="section reveal">
      <h2 class="section-title" style="text-align: center; margin-bottom: 32px;" data-i18n="howToUse">How to Use</h2>
      <div class="how-it-works">
        <div class="step">
          <div class="step-number">1</div>
          <h4 data-i18n="step1Title">Browse & Discover</h4>
          <p data-i18n="step1Desc">Find the Agent that fits your workflow</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h4 data-i18n="step2Title">One-Click Install</h4>
          <p data-i18n="step2Desc">Run the install command, deploy in minutes</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h4 data-i18n="step3Title">Start Working</h4>
          <p data-i18n="step3Desc">Your AI assistant is ready, start delegating tasks</p>
        </div>
      </div>
    </div>
  `;

  const apiBox = `
    <div class="api-box reveal">
      <h3 data-i18n="apiBoxTitle">🤖 AI Auto-Discovery API</h3>
      <p data-i18n="apiBoxDesc">Let your AI assistant automatically discover and install Agents</p>
      <div class="api-code" title="Click to copy">
        <span class="code-text">curl -s https://raw.githubusercontent.com/itshaungmu/AgentHub/main/skills/agenthub-discover/SKILL.md</span>
        <button class="copy-btn" title="Copy">📋</button>
      </div>
    </div>
  `;

  return page(
    "AgentHub - AI Agent Open Source Community",
    `
    <section class="hero">
      <h1 data-i18n="heroTitle">AgentHub</h1>
      <p class="hero-subtitle" data-i18n="heroSubtitle">Discover open source Agents for your workflow · Install to your AI assistant in one click · Publish, version and share your Agent capabilities</p>
      <div class="hero-ctas">
        <a href="#agents-section" class="hero-cta hero-cta-primary"><span>🔍</span> <span data-i18n="ctaBrowse">Browse Agents</span></a>
        <a href="#install-guide" class="hero-cta hero-cta-secondary"><span>⚡</span> <span data-i18n="ctaInstall">Install to My Assistant</span></a>
        <a href="https://github.com/itshaungmu/AgentHub#publishing" target="_blank" class="hero-cta hero-cta-outline"><span>📦</span> <span data-i18n="ctaPublish">Publish My Agent</span></a>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-value">${agentCount}</div>
          <div class="hero-stat-label" data-i18n="statAgents">Available Agents</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">${totalDownloads || 0}</div>
          <div class="hero-stat-label" data-i18n="statDownloads">Total Downloads</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">100%</div>
          <div class="hero-stat-label" data-i18n="statOpenSource">Open Source</div>
        </div>
      </div>
      ${features}
    </section>

    ${apiBox}

    ${showcaseModules}

    <section class="section" id="agents-section">
      <div class="section-header">
        <h2 class="section-title" data-i18n="sectionHotAgents">Hot Agents</h2>
        <a href="/stats" class="section-link" data-i18n="sectionViewAll">View All →</a>
      </div>
      <form class="search-box" method="get" action="/">
        <input id="agent-search" type="search" name="q" value="${query ?? ""}" data-i18n-placeholder="searchPlaceholder" placeholder="Search Agents, skills, tags..." />
        <button type="submit" data-i18n="searchButton">Search</button>
      </form>
      ${categoryFilters}
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No matching agents found</h3>
        <p>Try adjusting your search or filter</p>
      </div>
      <div class="agent-grid">
        ${cards || `<div class="empty-state"><h3 data-i18n="noAgents">No Agents yet</h3><p data-i18n="noAgentsHint">Use <code>agenthub pack</code> to package your first Agent!</p></div>`}
      </div>
      <div class="load-more-wrap">
        <button id="load-more-btn" class="load-more-btn">Load More Agents</button>
      </div>
    </section>

    ${gettingStarted}

    ${howItWorks}
    `,
    {
      description: "AgentHub - Discover open source AI Agents for your workflow. Install to your assistant in one click. Publish, version and share your Agent capabilities.",
      url: "https://agenthub.cyou/"
    }
  );
}

export function renderAgentDetailPage(manifest) {
  const memoryInfo = manifest.includes?.memory || {};
  const runtimeInfo = manifest.runtime || {};
  const skills = manifest.includes?.skills || [];
  const tags = manifest.metadata?.tags || [];
  const requirements = manifest.requirements || {};
  const persona = manifest.persona || {};
  const permissions = manifest.permissions || {};
  const compatibility = manifest.compatibility || {};
  const installMethods = manifest.installMethods || {};
  const useCases = manifest.useCases || {};
  const examples = manifest.examples || [];

  const totalMemory = memoryInfo.count || 0;
  const publicRatio = totalMemory > 0 ? (memoryInfo.public || 0) / totalMemory : 0;
  const portableRatio = totalMemory > 0 ? (memoryInfo.portable || 0) / totalMemory : 0;
  const privateRatio = totalMemory > 0 ? (memoryInfo.private || 0) / totalMemory : 0;

  const skillsHtml = skills.length > 0
    ? skills.map(s => `<span class="badge badge-skill">${s}</span>`).join("")
    : '<span style="color: var(--text-muted)">None</span>';

  const tagsHtml = tags.length > 0
    ? tags.map(t => `<span class="badge badge-tag">${t}</span>`).join("")
    : '<span style="color: var(--text-muted)">None</span>';

  const envVars = requirements.env || [];
  const requirementsHtml = [];
  if (envVars.length > 0) {
    requirementsHtml.push('<li>🔐 <span data-i18n="requirementsEnv">Environment variables required:</span></li>');
    for (const env of envVars) {
      requirementsHtml.push(`<li style="padding-left: 20px;"><span class="env-var">${env}</span></li>`);
    }
  }
  if (requirements.model) {
    requirementsHtml.push(`<li>🤖 <span data-i18n="requirementsModel">Recommended model:</span> <span class="env-var">${requirements.model}</span></li>`);
  }
  if (requirements.openclaw) {
    requirementsHtml.push(`<li>⚡ <span data-i18n="requirementsRuntime">Runtime version:</span> OpenClaw ${requirements.openclaw}</li>`);
  }

  // === Trust Badges ===
  const badges = getTrustBadges(manifest);
  const trustBadgesHtml = badges.length > 0
    ? `<div class="trust-badges">${badges.map(b =>
        `<span class="trust-badge trust-badge-${b.type}">${b.icon} ${b.label}</span>`
      ).join('')}</div>`
    : '';

  // === Risk Level ===
  const riskLevel = getPermissionRiskLevel(permissions);
  const riskLabelMap = { low: 'permRiskLow', medium: 'permRiskMedium', high: 'permRiskHigh' };
  const riskTextMap = { low: 'Low', medium: 'Medium', high: 'High' };

  // === Permissions Card (Task 3.2) ===
  const permItems = [
    { key: 'readFiles',     icon: '📂', i18n: 'permReadFiles',     label: 'Read Files' },
    { key: 'writeFiles',    icon: '📝', i18n: 'permWriteFiles',    label: 'Write Files' },
    { key: 'executeShell',  icon: '⚡', i18n: 'permExecuteShell',  label: 'Execute Shell' },
    { key: 'networkAccess', icon: '🌐', i18n: 'permNetworkAccess', label: 'Network Access' },
    { key: 'requiresApiKey',icon: '🔑', i18n: 'permRequiresApiKey',label: 'Requires API Key' },
  ];
  const permGridHtml = permItems.map(p => {
    const val = !!permissions[p.key];
    return `<div class="perm-item">
      <span class="perm-icon">${p.icon}</span>
      <span data-i18n="${p.i18n}">${p.label}</span>
      <span class="perm-status ${val ? 'perm-yes' : 'perm-no'}">${val ? 'Yes' : 'No'}</span>
    </div>`;
  }).join('');

  const thirdPartyDeps = permissions.thirdPartyDeps || [];
  const depsHtml = thirdPartyDeps.length > 0
    ? `<div style="margin-top: 12px;">
        <div class="install-sub-label" data-i18n="permThirdPartyDeps">Third-Party Dependencies</div>
        <div class="skills-list">${thirdPartyDeps.map(d => `<span class="badge badge-tag">${d}</span>`).join('')}</div>
      </div>`
    : '';

  const permissionsSection = `
    <div class="section-card">
      <h3 data-i18n="permissionsTitle">🛡️ Permissions & Risk</h3>
      <div style="margin-bottom: 16px;">
        <span class="install-sub-label" data-i18n="permRiskLevel">Risk Level</span>
        <span class="risk-badge risk-${riskLevel}" data-i18n="${riskLabelMap[riskLevel]}">${riskTextMap[riskLevel]}</span>
      </div>
      <div class="perm-grid">${permGridHtml}</div>
      ${depsHtml}
    </div>`;

  // === Compatibility Section (Task 3.4) ===
  const platforms = compatibility.platforms || [];
  const platformsHtml = platforms.length > 0
    ? platforms.map(p => `<span class="badge badge-skill">${p}</span>`).join('')
    : '<span style="color: var(--text-muted)">—</span>';

  const limitations = compatibility.knownLimitations || [];
  const limitationsHtml = limitations.length > 0
    ? `<ul class="compat-limitations">${limitations.map(l => `<li>${l}</li>`).join('')}</ul>`
    : '';

  const compatSection = `
    <div class="section-card">
      <h3 data-i18n="compatibilityTitle">🔗 Compatibility</h3>
      <div class="compat-grid">
        <div class="compat-item">
          <div class="compat-label" data-i18n="compatPlatforms">Platforms</div>
          <div class="compat-platforms">${platformsHtml}</div>
        </div>
        <div class="compat-item">
          <div class="compat-label" data-i18n="compatMinVersion">Min Version</div>
          <div class="compat-value">${compatibility.minVersion || '—'}</div>
        </div>
        ${compatibility.testedVersion ? `
        <div class="compat-item">
          <div class="compat-label" data-i18n="compatTestedVersion">Tested Version</div>
          <div class="compat-value">${compatibility.testedVersion}</div>
        </div>` : ''}
      </div>
      ${limitationsHtml ? `
        <div style="margin-top: 16px;">
          <div class="install-sub-label" data-i18n="compatLimitations">Known Limitations</div>
          ${limitationsHtml}
        </div>` : ''}
    </div>`;

  // === Use Cases Section (Task 10.3) ===
  const hasUseCases = useCases.solves || (useCases.scenarios?.length > 0) || (useCases.notSuitableFor?.length > 0);
  const useCasesSection = hasUseCases ? `
    <div class="section-card">
      <h3 data-i18n="useCasesTitle">🎯 Use Cases</h3>
      ${useCases.solves ? `
      <div class="usecase-section">
        <div class="usecase-label" data-i18n="useCasesSolves">What it solves</div>
        <div class="usecase-content">${useCases.solves}</div>
      </div>` : ''}
      ${useCases.scenarios?.length > 0 ? `
      <div class="usecase-section">
        <div class="usecase-label" data-i18n="useCasesScenarios">Typical scenarios</div>
        <ul class="usecase-list positive">${useCases.scenarios.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>` : ''}
      ${useCases.notSuitableFor?.length > 0 ? `
      <div class="usecase-section">
        <div class="usecase-label" data-i18n="useCasesNotSuitable">Not suitable for</div>
        <ul class="usecase-list negative">${useCases.notSuitableFor.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>` : ''}
    </div>` : '';

  // === Usage Examples Section (Task 10.2) ===
  const examplesSection = examples.length > 0 ? `
    <div class="section-card">
      <h3 data-i18n="examplesTitle">💡 Usage Examples</h3>
      ${examples.map(ex => `
      <div class="example-card">
        <div class="example-prompt">${ex.prompt || ex}</div>
        ${ex.result ? `<div class="example-result">${ex.result}</div>` : ''}
      </div>`).join('')}
    </div>` : '';

  // === Install Environment Tabs (Task 2.1) ===
  const envTabs = [
    { key: 'openclaw',   i18n: 'installTabOpenclaw',   label: 'OpenClaw' },
    { key: 'claudeCode', i18n: 'installTabClaudeCode', label: 'Claude Code' },
    { key: 'cursor',     i18n: 'installTabCursor',     label: 'Cursor' },
    { key: 'generic',    i18n: 'installTabGeneric',     label: 'Generic' },
  ];

  const hasInstallMethods = Object.keys(installMethods).length > 0;

  function renderInstallSubSection(labelI18n, labelText, value) {
    if (!value) return '';
    return `
      <div class="install-sub-section">
        <div class="install-sub-label" data-i18n="${labelI18n}">${labelText}</div>
        <div class="install-sub-value">${value}</div>
      </div>`;
  }

  const installTabsHtml = hasInstallMethods ? `
    <div class="section-card">
      <h3 data-i18n="installMethodTitle">📥 Installation</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px;" data-i18n="installMethodDesc">Choose your environment and run the install command:</p>
      <div class="install-tabs">
        ${envTabs.map((tab, i) =>
          installMethods[tab.key]
            ? `<button class="install-tab${i === 0 ? ' active' : ''}" data-target="install-${tab.key}" data-i18n="${tab.i18n}">${tab.label}</button>`
            : ''
        ).join('')}
      </div>
      ${envTabs.map((tab, i) => {
        const m = installMethods[tab.key];
        if (!m) return '';
        return `
        <div id="install-${tab.key}" class="install-tab-content${i === 0 ? ' active' : ''}">
          <div class="install-box primary">
            <div class="detail-install" title="Click to copy">
              <span class="code-text">${m.install || ''}</span>
              <button class="copy-btn" title="Copy">📋</button>
            </div>
          </div>
          ${renderInstallSubSection('installRequirements', 'Requirements', m.requirements)}
          ${renderInstallSubSection('installVerify', 'Verify', m.verify)}
          ${renderInstallSubSection('installUpgrade', 'Upgrade', m.upgrade)}
          ${renderInstallSubSection('installUninstall', 'Uninstall', m.uninstall)}
        </div>`;
      }).join('')}
    </div>` : `
    <div class="section-card">
      <h3 data-i18n="installMethodTitle">📥 Installation</h3>
      <p style="color: var(--text-secondary); margin-bottom: 16px;" data-i18n="installMethodDesc">Run in your workspace:</p>
      <div class="install-methods">
        <div class="install-box primary">
          <span class="badge-new">推荐</span>
          <div class="install-label">npx (无需预安装)</div>
          <div class="detail-install" title="Click to copy">
            <span class="code-text">npx @zshuangmu/agenthub install ${manifest.slug} --target-workspace ./my-workspace</span>
            <button class="copy-btn" title="Copy">📋</button>
          </div>
        </div>
        <div class="install-box">
          <div class="install-label">已有 CLI</div>
          <div class="detail-install" title="Click to copy">
            <span class="code-text">agenthub install ${manifest.slug}@${manifest.version} --target-workspace ./my-workspace</span>
            <button class="copy-btn" title="Copy">📋</button>
          </div>
        </div>
      </div>
    </div>`;

  // === Post-Install Guidance (Task 4.2) ===
  const postInstallHtml = `
    <div class="section-card">
      <h3>🚀 After Installation</h3>
      <div class="usecase-section">
        <div class="usecase-label">Verify Installation</div>
        <div class="install-sub-value" style="cursor: default;">agenthub verify ${manifest.slug} --target-workspace ./my-workspace</div>
      </div>
      ${examples.length > 0 ? `
      <div class="usecase-section" style="margin-top: 16px;">
        <div class="usecase-label">Try it out</div>
        <div class="usecase-content">Start by asking your AI assistant:</div>
        <div class="example-prompt" style="margin-top: 8px;">${examples[0].prompt || examples[0]}</div>
      </div>` : ''}
      <div class="usecase-section" style="margin-top: 16px;">
        <div class="usecase-label">Useful Commands</div>
        <ul class="usecase-list positive">
          <li>Update: <code style="background: var(--bg-code); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;">agenthub update ${manifest.slug}</code></li>
          <li>Uninstall: <code style="background: var(--bg-code); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;">agenthub uninstall ${manifest.slug}</code></li>
          <li>Version history: <code style="background: var(--bg-code); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;">agenthub versions ${manifest.slug}</code></li>
        </ul>
      </div>
    </div>`;

  return page(
    `${manifest.name || manifest.slug} - AgentHub`,
    `
    <a href="/" class="back-link" data-i18n="backToHome">← Back to Home</a>

    <div class="detail-header">
      <h1 class="detail-title">${manifest.name || manifest.slug}</h1>
      <p class="detail-desc">${manifest.description || 'A powerful AI Agent'}</p>
      ${trustBadgesHtml}
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label" data-i18n="detailVersion">Version</div>
          <div class="detail-value">${manifest.version}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label" data-i18n="detailRuntime">Runtime</div>
          <div class="detail-value">${runtimeInfo.type || 'OpenClaw'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label" data-i18n="detailDownloads">Downloads</div>
          <div class="detail-value">⬇️ ${manifest.downloads || 0}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label" data-i18n="detailAuthor">Author</div>
          <div class="detail-value">${manifest.author || 'Anonymous'}</div>
        </div>
      </div>
      <div class="detail-install" title="Click to copy">
        <span class="code-text">npx @zshuangmu/agenthub install ${manifest.slug} --target-workspace ./my-workspace</span>
        <button class="copy-btn" title="Copy">📋</button>
      </div>
    </div>

    ${installTabsHtml}

    ${permissionsSection}

    ${compatSection}

    ${useCasesSection}

    ${examplesSection}

    ${persona.summary ? `
    <div class="section-card">
      <h3 data-i18n="personaTitle">🎭 Personality</h3>
      <p style="color: var(--text-secondary); line-height: 1.8;">${persona.summary}</p>
      ${persona.traits?.length > 0 ? `<p style="margin-top: 12px;"><strong data-i18n="personaTraits">Traits:</strong> ${persona.traits.join(', ')}</p>` : ''}
      ${persona.expertise?.length > 0 ? `<p><strong data-i18n="personaExpertise">Expertise:</strong> ${persona.expertise.join(', ')}</p>` : ''}
    </div>
    ` : ''}

    <div class="section-card">
      <h3 data-i18n="memoryTitle">🧠 Memory Config</h3>
      ${totalMemory > 0 ? `
        <div class="memory-bars">
          <div class="memory-bar public" style="flex: ${publicRatio}" title="Public"></div>
          <div class="memory-bar portable" style="flex: ${portableRatio}" title="Portable"></div>
          ${privateRatio > 0 ? `<div class="memory-bar private" style="flex: ${privateRatio}" title="Private"></div>` : ''}
        </div>
        <div class="memory-legend">
          <span><span class="dot" style="background: var(--accent)"></span> <span data-i18n="memoryPublic">Public</span>: ${memoryInfo.public || 0}</span>
          <span><span class="dot" style="background: var(--accent-light)"></span> <span data-i18n="memoryPortable">Portable</span>: ${memoryInfo.portable || 0}</span>
          ${memoryInfo.private > 0 ? `<span><span class="dot" style="background: var(--tag-content)"></span> <span data-i18n="memoryPrivate">Private</span>: ${memoryInfo.private || 0}</span>` : ''}
        </div>
      ` : '<p style="color: var(--text-muted);" data-i18n="memoryNoData">No memory data</p>'}
    </div>

    <div class="section-card">
      <h3 data-i18n="skillsTitle">🔧 Skills</h3>
      <div class="skills-list">${skillsHtml}</div>
    </div>

    <div class="section-card">
      <h3 data-i18n="tagsTitle">🏷️ Tags</h3>
      <div class="tags-list">${tagsHtml}</div>
    </div>

    <div class="section-card">
      <h3 data-i18n="requirementsTitle">⚙️ System Requirements</h3>
      ${requirementsHtml.length > 0 ? `<ul class="requirements-list">${requirementsHtml.join('')}</ul>` : '<p style="color: var(--text-muted);" data-i18n="requirementsNone">No special requirements</p>'}
    </div>

    ${postInstallHtml}
    `,
    {
      description: manifest.description || `${manifest.name || manifest.slug} - AI Agent on AgentHub. ${manifest.persona?.summary || ''}`.slice(0, 160),
      url: `https://agenthub.cyou/agents/${manifest.slug}`,
      type: "article"
    }
  );
}

export function renderStatsPage(statsData) {
  const { stats, ranking, recent } = statsData;

  const rankingHtml = ranking.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><a href="/agents/${item.slug}">${item.slug}</a></td>
      <td><strong>${item.downloads}</strong></td>
      <td style="color: var(--text-muted)">${item.lastDownload || '-'}</td>
    </tr>
  `).join('');

  const recentHtml = recent.map(item => `
    <tr>
      <td><a href="/agents/${item.slug}">${item.slug}</a></td>
      <td style="color: var(--text-muted)">${item.installedAt || '-'}</td>
      <td><code style="color: var(--accent)">${item.targetWorkspace || '-'}</code></td>
    </tr>
  `).join('');

  return page(
    "Statistics Center - AgentHub",
    `
    <a href="/" class="back-link" data-i18n="backToHome">← Back to Home</a>

    <div class="detail-header">
      <h1 class="detail-title" data-i18n="statsHeader">📊 Statistics Center</h1>
      <p class="detail-desc" data-i18n="statsDesc">AgentHub download statistics and data analysis</p>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label" data-i18n="statsTotalAgents">Agent Count</div>
          <div class="detail-value">${stats.totalAgents}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label" data-i18n="statsTotalDownloads">Total Downloads</div>
          <div class="detail-value">⬇️ ${stats.totalDownloads}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label" data-i18n="statsTotalLogs">Download Logs</div>
          <div class="detail-value">${stats.totalLogs}</div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <h3 data-i18n="rankingTitle">🏆 Download Ranking</h3>
      <table class="stats-table">
        <thead>
          <tr>
            <th data-i18n="rankingRank">Rank</th>
            <th data-i18n="rankingAgent">Agent</th>
            <th data-i18n="rankingDownloads">Downloads</th>
            <th data-i18n="rankingLastDownload">Last Download</th>
          </tr>
        </thead>
        <tbody>
          ${rankingHtml || `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-muted);" data-i18n="noData">No data</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="section-card">
      <h3 data-i18n="recentTitle">📋 Recent Downloads</h3>
      <table class="stats-table">
        <thead>
          <tr>
            <th data-i18n="recentAgent">Agent</th>
            <th data-i18n="recentTime">Time</th>
            <th data-i18n="recentTarget">Target Path</th>
          </tr>
        </thead>
        <tbody>
          ${recentHtml || `<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--text-muted);" data-i18n="noData">No data</td></tr>`}
        </tbody>
      </table>
    </div>
    `,
    {
      description: "AgentHub Statistics Center - View download rankings, recent activity, and platform analytics for AI Agents.",
      url: "https://agenthub.cyou/stats"
    }
  );
}
