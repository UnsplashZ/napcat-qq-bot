const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ImageGenerator {
    constructor() {
        this.browser = null;
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async generatePreviewCard(data, type) {
        await this.init();
        const page = await this.browser.newPage();
        
        // Basic HTML template - In production, use a template engine like EJS or Handlebars
        // This is a simplified string template for demonstration
        let htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: 'Arial', sans-serif; background: #f4f4f4; padding: 20px; width: 400px; }
                .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .cover { width: 100%; height: 225px; object-fit: cover; }
                .content { padding: 15px; }
                .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
                .info { font-size: 14px; color: #666; margin-bottom: 5px; display: flex; justify-content: space-between;}
                .stats { margin-top: 10px; display: flex; gap: 15px; font-size: 12px; color: #999; }
                .stat-item { display: flex; align-items: center; }
            </style>
        </head>
        <body>
            <div class="card">
        `;

        if (type === 'video') {
            const info = data.data;
            htmlContent += `
                <img class="cover" src="${info.pic}" />
                <div class="content">
                    <div class="title">${info.title}</div>
                    <div class="info"><span>UP: ${info.owner.name}</span></div>
                    <div class="stats">
                        <span class="stat-item">▶ ${info.view?.count || info.stat?.view || 0}</span>
                        <span class="stat-item">👍 ${info.like || info.stat?.like || 0}</span>
                        <span class="stat-item">💬 ${info.reply || info.stat?.reply || 0}</span>
                    </div>
                </div>
            `;
        } else if (type === 'bangumi') {
            const info = data.data;
            htmlContent += `
                <img class="cover" src="${info.cover}" />
                <div class="content">
                    <div class="title">${info.title}</div>
                    <div class="info"><span>${info.new_ep?.desc || ''}</span></div>
                     <div class="stats">
                        <span class="stat-item">♥ ${info.stat?.follow || 0} 追番</span>
                        <span class="stat-item">★ ${info.rating?.score || 'N/A'}</span>
                    </div>
                </div>
            `;
        } else if (type === 'dynamic') {
            const info = data.data;
            // Structure varies heavily by dynamic type. Attempting to extract basic info.
            // Simplified extraction for text and images
            const module_author = info.modules?.module_author || {};
            const module_dynamic = info.modules?.module_dynamic || {};
            
            const authorName = module_author.name || 'Unknown';
            const pubTime = module_author.pub_time || '';
            
            let text = "";
            if (module_dynamic.desc) {
                text = module_dynamic.desc.text || "";
            } else if (module_dynamic.major?.opus) {
                text = module_dynamic.major.opus.summary?.text || "";
            }

            let images = [];
            if (module_dynamic.major?.draw?.items) {
                images = module_dynamic.major.draw.items.map(i => i.src);
            } else if (module_dynamic.major?.opus?.pics) {
                 images = module_dynamic.major.opus.pics.map(i => i.url);
            }

            htmlContent += `
                <div class="content">
                    <div class="info"><span>${authorName} · ${pubTime}</span></div>
                    <div class="title" style="font-size: 14px; font-weight: normal; margin-top: 10px;">${text}</div>
                    <div class="stats" style="margin-top: 10px;">
                        ${images.map(src => `<img src="${src}" style="width: 30%; height: auto; object-fit: cover; margin-right: 2px;">`).join('')}
                    </div>
                </div>
            `;
        }

        htmlContent += `
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent);
        const body = await page.$('body');
        const buffer = await body.screenshot({ type: 'png' }); // Capture just the body (or card)
        
        await page.close();
        
        // Save to temp file or return base64
        // Returning base64 is easier for NapCat to send directly
        return buffer.toString('base64');
    }
}

module.exports = new ImageGenerator();
