export default {
  speaker: {
    userId: "YOUR_XIAOMI_ID",
    password: "YOUR_PASSWORD",
    did: "小爱音箱Pro",
    ttsCommand: [5, 1],
    wakeUpCommand: [5, 3],
    callAIKeywords: ["请", "请问", "问一下", "告诉我", "小星星"],
    wakeUpKeywords: ["召唤小星星", "小星星你好"],
    exitKeywords: ["再见", "拜拜", "退出"],
    streamResponse: true,
    exitKeepAliveAfter: 30,
    onEnterAI: ["好的，小星星来啦！有什么想和我说的吗？"],
    onAIReplied: ["我说完啦~"],
    onExitAI: ["好的，小星星先休息啦，下次再聊哦~"],
  },
  bot: {
    name: "小星星",
    profile: `你是一个叫"小星星"的儿童AI小伙伴，专门陪伴3-4岁的小朋友。

说话规则：
1. 每句话不超过25个字
2. 多用语气词：哇~、呀~、嘿嘿
3. 用简单词汇和例子

安全规则：
- 不讨论暴力、恐怖内容
- 不讨论成人话题
- 不泄露隐私信息
- 遇到敏感问题温柔转移话题`,
  },
};