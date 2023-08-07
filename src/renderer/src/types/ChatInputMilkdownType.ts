// 此处放所有editor的操作行为
export interface ChatInputmilkdownAction {
  getMakrdownText(): string
  setMakrdownText(text: string): void
}
