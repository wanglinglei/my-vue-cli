class PromptModuleApi {
  constructor(creator) {
    this.creator = creator;
  }
  // 向 feature 数组里加入一个新的选项
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature);
  }

  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt);
  }

  // 选择完成之后的回调
  onPromptComplete(cb) {
    this.creator.promptCompleteCallbacks.push(cb);
  }
}

module.exports = PromptModuleApi;
