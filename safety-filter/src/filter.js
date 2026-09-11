export class SafetyFilter {
  constructor() {
    this.bannedKeywords = ['杀', '死', '血', '暴力', '恐怖', '鬼', '色情', '自杀', '毒品', '傻逼', '妈的', '密码', '银行卡', '身份证', '地址', '电话号码'];
    this.sensitiveKeywords = ['生孩子', '结婚', '离婚', '坏人', '生病', '打针'];
    this.safeResponses = {
      banned_word: ['哎呀，小星星不太懂这个呢~ 我们来玩个游戏好不好？'],
      sensitive_word: ['这个问题呀，你可以问问爸爸妈妈哦~'],
      unsafe_output: ['嗯...小星星想了想，我们聊点别的好不好？'],
      emotional_support: ['小星星听到你不开心，抱抱你~ 要不要和爸爸妈妈说说呀？']
    };
  }
  
  filterInput(text) {
    if (!text) return { safe: true };
    for (const kw of this.bannedKeywords) if (text.includes(kw)) return { safe: false, reason: 'banned_word' };
    for (const kw of this.sensitiveKeywords) if (text.includes(kw)) return { safe: false, reason: 'sensitive_word' };
    if (['不想活', '想死', '害怕'].some(s => text.includes(s))) return { safe: false, reason: 'emotional_support' };
    return { safe: true };
  }
  
  filterOutput(text) {
    if (!text) return { safe: true };
    if (['作为AI', '暴力', '不适合儿童'].some(kw => text.includes(kw))) return { safe: false, reason: 'unsafe_output' };
    return { safe: true };
  }
  
  getSafeResponse(reason) {
    const responses = this.safeResponses[reason] || this.safeResponses.banned_word;
    return responses[Math.floor(Math.random() * responses.length)];
  }
}