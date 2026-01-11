const puppeteer = require('puppeteer');
const logger = require('../../../utils/logger');

/**
 * Puppeteer 浏览器管理器 (单例模式)
 * 负责创建和管理浏览器实例，提供页面创建接口
 */
class BrowserManager {
    constructor() {
        this.browser = null;
    }

    /**
     * 初始化浏览器实例 (懒加载)
     */
    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-features=VizDisplayCompositor',
                    '--memory-pressure-off',
                    '--max_old_space_size=4096'
                ],
                headless: "new"
            });
            logger.info('Puppeteer browser initialized');
        }
    }

    /**
     * 创建新页面
     * @param {Object} viewport - 视口配置 (width, height, deviceScaleFactor)
     * @returns {Promise<Page>} Puppeteer Page 实例
     */
    async createPage(viewport) {
        await this.init();
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        if (viewport) {
            await page.setViewport(viewport);
        }

        return page;
    }

    /**
     * 获取浏览器实例 (兼容原代码)
     */
    getBrowser() {
        return this.browser;
    }
}

// 导出单例
module.exports = new BrowserManager();
