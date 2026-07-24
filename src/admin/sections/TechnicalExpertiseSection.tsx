import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function TechnicalExpertiseSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Technical Expertise</h2>
      <ArrayEditor
        items={content.technicalExpertise}
        itemLabel="Category"
        onChange={(technicalExpertise) => onChange({ technicalExpertise })}
        makeItem={() => ({
          id: `exp-cat-${Date.now()}`,
          category: 'New Category',
          items: [],
        })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <Field label="Category name">
              <TextInput
                value={item.category}
                onChange={(e) => update({ category: e.target.value })}
              />
            </Field>
            <Field label="Skills" hint="Comma-separated">
              <TextInput
                value={item.items.join(', ')}
                onChange={(e) =>
                  update({
                    items: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
