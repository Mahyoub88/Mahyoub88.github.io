import type { SiteContent } from '../../types/content'
import { Field, TextInput, TextArea } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function ArticlesSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Articles</h2>
      <ArrayEditor
        items={content.articles}
        itemLabel="Article"
        onChange={(articles) => onChange({ articles })}
        makeItem={() => ({
          id: `article-${Date.now()}`,
          title: 'New Article',
          excerpt: '',
          date: new Date().toISOString().slice(0, 10),
          url: '',
        })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label="Title">
                  <TextInput
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Date">
                <TextInput
                  type="date"
                  value={item.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Excerpt">
              <TextArea
                rows={2}
                value={item.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
              />
            </Field>
            <Field label="Link" hint="Leave empty for no external link">
              <TextInput value={item.url} onChange={(e) => update({ url: e.target.value })} />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
