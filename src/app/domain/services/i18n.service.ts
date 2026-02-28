import { Injectable, signal, computed } from '@angular/core';

/**
 * Supported languages
 */
export type Language = 'en' | 'zh' | 'zh-TW' | 'es' | 'fr' | 'de';

/**
 * Language configuration
 */
export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * Translation dictionary
 */
type TranslationDictionary = Record<string, string>;

/**
 * I18n Service
 * Handles internationalization and localization
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly STORAGE_KEY = 'arcana_language';
  private readonly translations = new Map<Language, TranslationDictionary>();

  /**
   * Available languages
   */
  readonly languages: LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ];

  /**
   * Current language signal
   */
  private readonly currentLanguageSignal = signal<Language>(this.loadLanguage());

  /**
   * Current language (readonly)
   */
  readonly currentLanguage = this.currentLanguageSignal.asReadonly();

  /**
   * Current language config
   */
  readonly currentLanguageConfig = computed(() =>
    this.languages.find(l => l.code === this.currentLanguageSignal())!
  );

  constructor() {
    this.loadTranslations();
  }

  /**
   * Load translations for all languages
   */
  private loadTranslations(): void {
    // English translations
    this.translations.set('en', {
      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.create': 'Create',
      'common.search': 'Search',
      'common.refresh': 'Refresh',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.submit': 'Submit',
      'common.reset': 'Reset',
      'common.clear': 'Clear',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.download': 'Download',
      'common.upload': 'Upload',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.info': 'Information',

      // User Management
      'user.management': 'User Management',
      'user.list.title': 'User Management',
      'user.list.subtitle': 'Manage and view all users',
      'user.list.create': 'Create New User',
      'user.list.search.placeholder': 'Search by name or email...',
      'user.list.view.all': 'View All Users',
      'user.list.showing': 'Showing {{start}} - {{end}} of {{total}}',
      'user.list.no.results': 'No users found',
      'user.list.empty.message': 'Get started by creating your first user',
      'user.list.empty.search': 'No users match your search criteria',

      // User Detail
      'user.detail.title': 'User Details',
      'user.detail.subtitle': 'View user information',
      'user.detail.information': 'User Information',
      'user.detail.information.description': 'This is a detailed view of the user. You can edit the user information by clicking the "Edit User" button above.',
      'user.detail.user.id': 'User ID',
      'user.detail.first.name': 'First Name',
      'user.detail.last.name': 'Last Name',
      'user.detail.email.address': 'Email Address',
      'user.detail.created.at': 'Created At',
      'user.detail.updated.at': 'Updated At',
      'user.detail.avatar.url': 'Avatar URL',
      'user.detail.back.to.list': 'Back to List',
      'user.detail.edit.user': 'Edit User',
      'user.detail.loading': 'Loading user details...',

      // User Form
      'user.form.create.title': 'Create User',
      'user.form.edit.title': 'Edit User',
      'user.form.create.subtitle': 'Fill in the form to create a new user',
      'user.form.edit.subtitle': 'Update user information',
      'user.form.loading': 'Loading user data...',
      'user.form.field.first.name': 'First Name',
      'user.form.field.last.name': 'Last Name',
      'user.form.field.email': 'Email',
      'user.form.field.avatar': 'Avatar URL',
      'user.form.placeholder.first.name': 'Enter first name',
      'user.form.placeholder.last.name': 'Enter last name',
      'user.form.placeholder.email': 'Enter email address',
      'user.form.placeholder.avatar': 'https://example.com/avatar.jpg',
      'user.form.optional': 'Optional',
      'user.form.button.cancel': 'Cancel',
      'user.form.button.saving': 'Saving...',
      'user.form.button.create': 'Create User',
      'user.form.button.update': 'Update User',
      'user.form.help.title': 'Field Requirements',
      'user.form.help.name.length': 'First and last names must be at least 2 characters',
      'user.form.help.name.characters': 'Names can only contain letters, spaces, hyphens, and apostrophes',
      'user.form.help.email.format': 'Email must be a valid email address format',
      'user.form.help.avatar.optional': 'Avatar URL is optional but must be a valid URL if provided',
      'user.form.first.name': 'First Name',
      'user.form.last.name': 'Last Name',
      'user.form.email': 'Email',
      'user.form.avatar': 'Avatar URL',
      'user.form.save': 'Save User',
      'user.form.cancel': 'Cancel',

      // Form Validation Errors
      'user.form.error.first.name.required': 'First name is required',
      'user.form.error.first.name.min': 'First name must be at least 2 characters',
      'user.form.error.first.name.max': 'First name must not exceed 50 characters',
      'user.form.error.first.name.pattern': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'user.form.error.last.name.required': 'Last name is required',
      'user.form.error.last.name.min': 'Last name must be at least 2 characters',
      'user.form.error.last.name.max': 'Last name must not exceed 50 characters',
      'user.form.error.last.name.pattern': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'user.form.error.email.required': 'Email is required',
      'user.form.error.email.invalid': 'Please enter a valid email address',
      'user.form.error.avatar.invalid': 'Please enter a valid URL',

      // Success Messages
      'user.created.success': 'User {{name}} created successfully',
      'user.updated.success': 'User {{name}} updated successfully',
      'user.deleted.success': 'User {{name}} deleted successfully',

      // Delete Confirmation
      'user.delete.title': 'Delete User',
      'user.delete.message': 'Are you sure you want to delete {{name}}?',
      'user.delete.description': 'This action cannot be undone.',

      // Error Messages
      'error.network': 'Unable to connect to the server. Please check your internet connection.',
      'error.validation': 'Please check your input and try again.',
      'error.storage': 'Unable to save data locally. Please try again.',
      'error.authentication': 'Authentication required. Please log in.',
      'error.authorization': 'You do not have permission to perform this action.',
      'error.not.found': 'The requested resource was not found.',
      'error.server': 'Server error occurred. Please try again later.',
      'error.unknown': 'An unexpected error occurred. Please try again.',

      // Validation Messages
      'validation.first.name.required': 'First name is required',
      'validation.first.name.too.short': 'First name must be at least 2 characters',
      'validation.first.name.too.long': 'First name must not exceed 50 characters',
      'validation.first.name.invalid.characters': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'validation.last.name.required': 'Last name is required',
      'validation.last.name.too.short': 'Last name must be at least 2 characters',
      'validation.last.name.too.long': 'Last name must not exceed 50 characters',
      'validation.last.name.invalid.characters': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'validation.email.required': 'Email is required',
      'validation.email.too.long': 'Email must not exceed 100 characters',
      'validation.email.invalid': 'Please enter a valid email address',
      'validation.avatar.invalid.url': 'Please enter a valid URL for avatar',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome back, {{name}}',
      'dashboard.stats.users': 'Total Users',
      'dashboard.stats.projects': 'Active Projects',
      'dashboard.stats.tasks': 'Pending Tasks',
      'dashboard.stats.messages': 'Messages',
      'dashboard.quick.actions': 'Quick Actions',
      'dashboard.recent.activity': 'Recent Activity',
      'dashboard.system.stats': 'System Stats',

      // Navigation
      'nav.main.menu': 'MAIN MENU',
      'nav.home': 'Dashboard',
      'nav.users': 'User Management',
      'nav.projects': 'Projects',
      'nav.projects.all': 'All Projects',
      'nav.projects.create': 'Create Project',
      'nav.projects.archived': 'Archived',
      'nav.tasks': 'Tasks',
      'nav.tasks.my': 'My Tasks',
      'nav.tasks.recent': 'Recent',
      'nav.tasks.important': 'Important',
      'nav.calendar': 'Calendar',
      'nav.messages': 'Messages',
      'nav.documents': 'Documents',
      'nav.analytics': 'Analytics',
      'nav.analytics.overview': 'Overview',
      'nav.analytics.reports': 'Reports',
      'nav.analytics.performance': 'Performance',
      'nav.settings': 'Settings',
      'nav.profile': 'View Profile',
      'nav.logout': 'Logout',
      'nav.my.profile': 'My Profile',
      'nav.notifications': 'Notifications',
      'nav.help': 'Help',

      // Header
      'header.search.placeholder': 'Search...',

      // Sidebar
      'sidebar.storage': 'Storage',

      // User Panel
      'panel.activity.center': 'Activity Center',
      'panel.activity.tab': 'Activity',
      'panel.notifications.tab': 'Notifications',
      'panel.settings': 'Settings',
      'panel.recent.activity': 'Recent Activity',
      'panel.clear.all': 'Clear All',

      // Storage
      'storage.label': 'Storage',
    });

    // Chinese (Simplified) translations
    this.translations.set('zh', {
      // Common
      'common.loading': '加载中...',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.create': '创建',
      'common.search': '搜索',
      'common.refresh': '刷新',
      'common.confirm': '确认',
      'common.close': '关闭',
      'common.back': '返回',
      'common.next': '下一步',
      'common.previous': '上一步',
      'common.submit': '提交',
      'common.reset': '重置',
      'common.clear': '清除',
      'common.filter': '筛选',
      'common.export': '导出',
      'common.import': '导入',
      'common.download': '下载',
      'common.upload': '上传',
      'common.yes': '是',
      'common.no': '否',
      'common.ok': '确定',
      'common.error': '错误',
      'common.success': '成功',
      'common.warning': '警告',
      'common.info': '信息',

      // User Management
      'user.management': '用户管理',
      'user.list.title': '用户管理',
      'user.list.subtitle': '管理和查看所有用户',
      'user.list.create': '创建新用户',
      'user.list.search.placeholder': '按姓名或电子邮件搜索...',
      'user.list.view.all': '查看所有用户',
      'user.list.showing': '显示 {{start}} - {{end}} 共 {{total}} 条',
      'user.list.no.results': '未找到用户',
      'user.list.empty.message': '从创建您的第一个用户开始',
      'user.list.empty.search': '没有用户匹配您的搜索条件',

      // User Detail
      'user.detail.title': '用户详情',
      'user.detail.subtitle': '查看用户信息',
      'user.detail.information': '用户信息',
      'user.detail.information.description': '这是用户的详细视图。您可以通过点击上方的"编辑用户"按钮来编辑用户信息。',
      'user.detail.user.id': '用户ID',
      'user.detail.first.name': '名字',
      'user.detail.last.name': '姓氏',
      'user.detail.email.address': '电子邮件地址',
      'user.detail.created.at': '创建时间',
      'user.detail.updated.at': '更新时间',
      'user.detail.avatar.url': '头像URL',
      'user.detail.back.to.list': '返回列表',
      'user.detail.edit.user': '编辑用户',
      'user.detail.loading': '正在加载用户详情...',

      // User Form
      'user.form.create.title': '创建用户',
      'user.form.edit.title': '编辑用户',
      'user.form.create.subtitle': '填写表单以创建新用户',
      'user.form.edit.subtitle': '更新用户信息',
      'user.form.loading': '正在加载用户数据...',
      'user.form.field.first.name': '名字',
      'user.form.field.last.name': '姓氏',
      'user.form.field.email': '电子邮件',
      'user.form.field.avatar': '头像URL',
      'user.form.placeholder.first.name': '输入名字',
      'user.form.placeholder.last.name': '输入姓氏',
      'user.form.placeholder.email': '输入电子邮件地址',
      'user.form.placeholder.avatar': 'https://example.com/avatar.jpg',
      'user.form.optional': '可选',
      'user.form.button.cancel': '取消',
      'user.form.button.saving': '保存中...',
      'user.form.button.create': '创建用户',
      'user.form.button.update': '更新用户',
      'user.form.help.title': '字段要求',
      'user.form.help.name.length': '名字和姓氏至少需要2个字符',
      'user.form.help.name.characters': '名字只能包含字母、空格、连字符和撇号',
      'user.form.help.email.format': '电子邮件必须是有效的电子邮件地址格式',
      'user.form.help.avatar.optional': '头像URL是可选的，但如果提供必须是有效的URL',
      'user.form.first.name': '名字',
      'user.form.last.name': '姓氏',
      'user.form.email': '电子邮件',
      'user.form.avatar': '头像URL',
      'user.form.save': '保存用户',
      'user.form.cancel': '取消',

      // Form Validation Errors
      'user.form.error.first.name.required': '名字是必填项',
      'user.form.error.first.name.min': '名字至少需要2个字符',
      'user.form.error.first.name.max': '名字不能超过50个字符',
      'user.form.error.first.name.pattern': '名字只能包含字母、空格、连字符和撇号',
      'user.form.error.last.name.required': '姓氏是必填项',
      'user.form.error.last.name.min': '姓氏至少需要2个字符',
      'user.form.error.last.name.max': '姓氏不能超过50个字符',
      'user.form.error.last.name.pattern': '姓氏只能包含字母、空格、连字符和撇号',
      'user.form.error.email.required': '电子邮件是必填项',
      'user.form.error.email.invalid': '请输入有效的电子邮件地址',
      'user.form.error.avatar.invalid': '请输入有效的URL',

      // Success Messages
      'user.created.success': '用户 {{name}} 创建成功',
      'user.updated.success': '用户 {{name}} 更新成功',
      'user.deleted.success': '用户 {{name}} 删除成功',

      // Delete Confirmation
      'user.delete.title': '删除用户',
      'user.delete.message': '您确定要删除 {{name}} 吗？',
      'user.delete.description': '此操作无法撤消。',

      // Error Messages
      'error.network': '无法连接到服务器。请检查您的互联网连接。',
      'error.validation': '请检查您的输入并重试。',
      'error.storage': '无法在本地保存数据。请重试。',
      'error.authentication': '需要身份验证。请登录。',
      'error.authorization': '您无权执行此操作。',
      'error.not.found': '未找到请求的资源。',
      'error.server': '服务器错误。请稍后重试。',
      'error.unknown': '发生意外错误。请重试。',

      // Validation Messages
      'validation.first.name.required': '名字是必填项',
      'validation.first.name.too.short': '名字至少需要2个字符',
      'validation.first.name.too.long': '名字不能超过50个字符',
      'validation.first.name.invalid.characters': '名字只能包含字母、空格、连字符和撇号',
      'validation.last.name.required': '姓氏是必填项',
      'validation.last.name.too.short': '姓氏至少需要2个字符',
      'validation.last.name.too.long': '姓氏不能超过50个字符',
      'validation.last.name.invalid.characters': '姓氏只能包含字母、空格、连字符和撇号',
      'validation.email.required': '电子邮件是必填项',
      'validation.email.too.long': '电子邮件不能超过100个字符',
      'validation.email.invalid': '请输入有效的电子邮件地址',
      'validation.avatar.invalid.url': '请输入有效的URL',

      // Dashboard
      'dashboard.title': '仪表板',
      'dashboard.welcome': '欢迎回来，{{name}}',
      'dashboard.stats.users': '总用户数',
      'dashboard.stats.projects': '活跃项目',
      'dashboard.stats.tasks': '待办任务',
      'dashboard.stats.messages': '消息',
      'dashboard.quick.actions': '快速操作',
      'dashboard.recent.activity': '最近活动',
      'dashboard.system.stats': '系统统计',

      // Navigation
      'nav.main.menu': '主菜单',
      'nav.home': '仪表板',
      'nav.users': '用户管理',
      'nav.projects': '项目',
      'nav.projects.all': '所有项目',
      'nav.projects.create': '创建项目',
      'nav.projects.archived': '已归档',
      'nav.tasks': '任务',
      'nav.tasks.my': '我的任务',
      'nav.tasks.recent': '最近',
      'nav.tasks.important': '重要',
      'nav.calendar': '日历',
      'nav.messages': '消息',
      'nav.documents': '文档',
      'nav.analytics': '分析',
      'nav.analytics.overview': '概览',
      'nav.analytics.reports': '报告',
      'nav.analytics.performance': '性能',
      'nav.settings': '设置',
      'nav.profile': '查看个人资料',
      'nav.logout': '退出登录',
      'nav.my.profile': '我的资料',
      'nav.notifications': '通知',
      'nav.help': '帮助',

      // Header
      'header.search.placeholder': '搜索...',

      // Sidebar
      'sidebar.storage': '存储',

      // User Panel
      'panel.activity.center': '活动中心',
      'panel.activity.tab': '活动',
      'panel.notifications.tab': '通知',
      'panel.settings': '设置',
      'panel.recent.activity': '最近活动',
      'panel.clear.all': '全部清除',

      // Storage
      'storage.label': '存储',
    });

    // Copy simplified Chinese for traditional Chinese (can be customized later)
    const zhTW = { ...this.translations.get('zh')! };
    zhTW['user.management'] = '使用者管理';
    zhTW['user.list.title'] = '使用者管理';
    zhTW['user.list.subtitle'] = '管理和檢視所有使用者';
    zhTW['user.list.create'] = '建立新使用者';
    zhTW['user.list.search.placeholder'] = '按姓名或電子郵件搜尋...';
    zhTW['user.list.empty.message'] = '從建立您的第一個使用者開始';
    zhTW['user.list.empty.search'] = '沒有使用者符合您的搜尋條件';
    zhTW['user.list.no.results'] = '未找到使用者';
    zhTW['user.detail.title'] = '使用者詳情';
    zhTW['user.detail.subtitle'] = '檢視使用者資訊';
    zhTW['user.detail.information'] = '使用者資訊';
    zhTW['user.detail.information.description'] = '這是使用者的詳細檢視。您可以透過點擊上方的「編輯使用者」按鈕來編輯使用者資訊。';
    zhTW['user.detail.user.id'] = '使用者ID';
    zhTW['user.detail.first.name'] = '名字';
    zhTW['user.detail.last.name'] = '姓氏';
    zhTW['user.detail.email.address'] = '電子郵件地址';
    zhTW['user.detail.created.at'] = '建立時間';
    zhTW['user.detail.updated.at'] = '更新時間';
    zhTW['user.detail.avatar.url'] = '頭像URL';
    zhTW['user.detail.back.to.list'] = '返回列表';
    zhTW['user.detail.edit.user'] = '編輯使用者';
    zhTW['user.detail.loading'] = '正在載入使用者詳情...';
    zhTW['error.network'] = '無法連接到伺服器。請檢查您的網際網路連線。';
    zhTW['error.validation'] = '請檢查您的輸入並重試。';
    zhTW['error.storage'] = '無法在本機儲存資料。請重試。';
    zhTW['error.authentication'] = '需要身份驗證。請登入。';
    zhTW['error.authorization'] = '您無權執行此操作。';
    zhTW['error.not.found'] = '未找到請求的資源。';
    zhTW['error.server'] = '伺服器錯誤。請稍後重試。';
    zhTW['error.unknown'] = '發生意外錯誤。請重試。';
    zhTW['validation.first.name.required'] = '名字是必填項';
    zhTW['validation.first.name.too.short'] = '名字至少需要2個字符';
    zhTW['validation.first.name.too.long'] = '名字不能超過50個字符';
    zhTW['validation.first.name.invalid.characters'] = '名字只能包含字母、空格、連字符和撇號';
    zhTW['validation.last.name.required'] = '姓氏是必填項';
    zhTW['validation.last.name.too.short'] = '姓氏至少需要2個字符';
    zhTW['validation.last.name.too.long'] = '姓氏不能超過50個字符';
    zhTW['validation.last.name.invalid.characters'] = '姓氏只能包含字母、空格、連字符和撇號';
    zhTW['validation.email.required'] = '電子郵件是必填項';
    zhTW['validation.email.too.long'] = '電子郵件不能超過100個字符';
    zhTW['validation.email.invalid'] = '請輸入有效的電子郵件地址';
    zhTW['validation.avatar.invalid.url'] = '請輸入有效的URL';
    zhTW['nav.main.menu'] = '主選單';
    zhTW['nav.home'] = '儀表板';
    zhTW['nav.users'] = '使用者管理';
    zhTW['nav.projects'] = '專案';
    zhTW['nav.projects.all'] = '所有專案';
    zhTW['nav.projects.create'] = '建立專案';
    zhTW['nav.projects.archived'] = '已封存';
    zhTW['nav.tasks'] = '任務';
    zhTW['nav.tasks.my'] = '我的任務';
    zhTW['nav.tasks.recent'] = '最近';
    zhTW['nav.tasks.important'] = '重要';
    zhTW['nav.calendar'] = '行事曆';
    zhTW['nav.messages'] = '訊息';
    zhTW['nav.documents'] = '文件';
    zhTW['nav.analytics'] = '分析';
    zhTW['nav.analytics.overview'] = '概覽';
    zhTW['nav.analytics.reports'] = '報告';
    zhTW['nav.analytics.performance'] = '效能';
    zhTW['nav.settings'] = '設定';
    zhTW['nav.profile'] = '檢視個人資料';
    zhTW['nav.logout'] = '登出';
    zhTW['nav.my.profile'] = '我的資料';
    zhTW['nav.notifications'] = '通知';
    zhTW['nav.help'] = '幫助';
    zhTW['header.search.placeholder'] = '搜尋...';
    zhTW['sidebar.storage'] = '儲存空間';
    zhTW['panel.activity.center'] = '活動中心';
    zhTW['panel.activity.tab'] = '活動';
    zhTW['panel.notifications.tab'] = '通知';
    zhTW['panel.settings'] = '設定';
    zhTW['panel.recent.activity'] = '最近活動';
    zhTW['panel.clear.all'] = '全部清除';
    zhTW['storage.label'] = '儲存空間';
    this.translations.set('zh-TW', zhTW);

    // Spanish, French, German (basic translations, can be expanded)
    this.translations.set('es', {
      ...this.translations.get('en')!,
      'user.management': 'Gestión de Usuarios',
      'user.list.create': 'Crear Nuevo Usuario',
    });

    this.translations.set('fr', {
      ...this.translations.get('en')!,
      'user.management': 'Gestion des Utilisateurs',
      'user.list.create': 'Créer un Nouvel Utilisateur',
    });

    this.translations.set('de', {
      ...this.translations.get('en')!,
      'user.management': 'Benutzerverwaltung',
      'user.list.create': 'Neuen Benutzer Erstellen',
    });
  }

  /**
   * Load language from localStorage
   */
  private loadLanguage(): Language {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return this.isValidLanguage(stored) ? stored : 'en';
  }

  /**
   * Check if language code is valid
   */
  private isValidLanguage(code: any): code is Language {
    return typeof code === 'string' && this.languages.some(l => l.code === code);
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    this.currentLanguageSignal.set(language);
    localStorage.setItem(this.STORAGE_KEY, language);
    document.documentElement.lang = language;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSignal();
  }

  /**
   * Translate a key
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const currentLang = this.currentLanguageSignal();
    const dictionary = this.translations.get(currentLang);

    if (!dictionary) {
      console.warn(`No translations found for language: ${currentLang}`);
      return key;
    }

    let translation = dictionary[key];

    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Interpolate parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replaceAll(
          new RegExp(`{{${paramKey}}}`, 'g'),
          String(paramValue)
        );
      });
    }

    return translation;
  }

  /**
   * Shorthand for translate
   */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }
}
