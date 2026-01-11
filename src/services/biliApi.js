const { spawn } = require('child_process');
const config = require('../config');
const logger = require('../utils/logger');
const path = require('path');

class BiliApi {
    constructor() {
        this.pythonPath = config.pythonPath;
        this.scriptPath = config.biliScriptPath;
        this.retryDelay = 10000; // 10秒重试延迟
        this.maxRetries = 1; // 最多重试1次
    }

    async runCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const processArgs = [this.scriptPath, command, ...args];
            const pythonProcess = spawn(this.pythonPath, processArgs);

            const chunks = [];
            let errorString = '';

            // Set timeout for Python process (60 seconds)
            const timeout = setTimeout(() => {
                pythonProcess.kill();
                reject(new Error(`Python script timed out for command: ${command}`));
            }, 60000);

            pythonProcess.stdout.on('data', (data) => {
                chunks.push(data);
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timeout);
                if (code !== 0) {
                    // Check if it was killed by timeout (signal usually SIGTERM or SIGKILL)
                    if (code === null) {
                         // Process killed, likely by timeout
                         return; // Already rejected in timeout
                    }
                    logger.error(`Python script exited with code ${code}: ${errorString}`);
                    reject(new Error(`Python script exited with code ${code}`));
                    return;
                }
                const dataString = Buffer.concat(chunks).toString();
                try {
                    const json = JSON.parse(dataString);
                    resolve(json);
                } catch (e) {
                    logger.error('Failed to parse Python output:', dataString.substring(0, 500) + '...'); // Log partial output
                    reject(e);
                }
            });

            pythonProcess.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    /**
     * 带重试机制的命令执行
     * @param {string} command - 命令名称
     * @param {Array} args - 命令参数
     * @param {number} retryCount - 当前重试次数（内部使用）
     * @returns {Promise} 执行结果
     */
    async runCommandWithRetry(command, args = [], retryCount = 0) {
        try {
            logger.debug(`Executing command: ${command} (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
            const result = await this.runCommand(command, args);

            // 成功执行，返回结果
            if (retryCount > 0) {
                logger.info(`Command ${command} succeeded after ${retryCount} retry(ies)`);
            }
            return result;
        } catch (error) {
            // 如果还有重试机会
            if (retryCount < this.maxRetries) {
                logger.warn(`Command ${command} failed (attempt ${retryCount + 1}/${this.maxRetries + 1}): ${error.message}`);
                logger.info(`Retrying in ${this.retryDelay / 1000} seconds...`);

                // 等待后重试
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.runCommandWithRetry(command, args, retryCount + 1);
            } else {
                // 已达到最大重试次数，记录错误并抛出
                logger.error(`Command ${command} failed after ${this.maxRetries + 1} attempts: ${error.message}`);
                throw error;
            }
        }
    }

    async getVideoInfo(bvid) {
        return this.runCommand('video', [bvid]);
    }

    async getLoginUrl() {
        return this.runCommand('login_url');
    }

    async checkLogin(key) {
        return this.runCommand('login_check', [key]);
    }

    async getUserDynamic(uid) {
        return this.runCommandWithRetry('user_dynamic', [uid]);
    }

    async getUserLive(uid) {
        return this.runCommandWithRetry('user_live', [uid]);
    }

    async getDynamicInfo(dynamicId) {
        return this.runCommandWithRetry('dynamic_detail', [dynamicId]);
    }

    async getArticleInfo(cvid) {
        return this.runCommand('article', [cvid]);
    }

    async getBangumiInfo(seasonId) {
        return this.runCommandWithRetry('bangumi', [seasonId]);
    }

    async getLiveRoomInfo(roomId) {
        return this.runCommandWithRetry('live_room', [roomId]);
    }

    async getOpusInfo(opusId) {
        return this.runCommand('opus', [opusId]);
    }

    async getUserInfo(uid) {
        return this.runCommandWithRetry('user_info', [uid]);
    }

    async getUserCard(uid) {
        return this.runCommand('user_card', [uid]);
    }

    async getEpInfo(epId) {
        return this.runCommand('ep', [epId]);
    }

    async getMediaInfo(mediaId) {
        return this.runCommand('media', [mediaId]);
    }

    async getMyFollowings(groupName) {
        const args = groupName ? [groupName] : [];
        return this.runCommandWithRetry('my_followings', args);
    }
}

module.exports = new BiliApi();