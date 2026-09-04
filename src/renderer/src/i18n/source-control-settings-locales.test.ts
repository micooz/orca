import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import es from './locales/es.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import zh from './locales/zh.json'

describe('Source Control settings locales', () => {
  it('translates both visibility settings in every supported locale', () => {
    for (const locale of [en, es, ja, ko, zh]) {
      expect(locale.auto.components.settings.GitPane.mergeUntrackedFilesTitle).toBeTruthy()
      expect(locale.auto.components.settings.GitPane.mergeUntrackedFilesDescription).toBeTruthy()
      expect(locale.auto.components.settings.GitPane.showCommittedChangesTitle).toBeTruthy()
      expect(locale.auto.components.settings.GitPane.showCommittedChangesDescription).toBeTruthy()
    }
  })

  it('uses the intended Simplified Chinese labels', () => {
    expect(zh.auto.components.settings.GitPane).toMatchObject({
      mergeUntrackedFilesTitle: '将未跟踪文件合并到更改中',
      showCommittedChangesTitle: '显示已提交的更改'
    })
  })
})
