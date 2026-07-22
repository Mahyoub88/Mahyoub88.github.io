import type { SiteContent } from '../../types/content'
import { Field, TextInput, TextArea } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'
import { TagsInput } from '../ui/TagsInput'

export function ExperienceSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Experience</h2>
      <ArrayEditor
        items={content.experience}
        itemLabel="Role"
        onChange={(experience) => onChange({ experience })}
        makeItem={() => ({
          id: `exp-${Date.now()}`,
          role: 'New Role',
          company: 'Company',
          period: '2026 — Present',
          description: '',
          tags: [],
        })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Role">
                <TextInput value={item.role} onChange={(e) => update({ role: e.target.value })} />
              </Field>
              <Field label="Company">
                <TextInput
                  value={item.company}
                  onChange={(e) => update({ company: e.target.value })}
                />
              </Field>
              <Field label="Period">
                <TextInput
                  value={item.period}
                  onChange={(e) => update({ period: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                rows={3}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            <Field label="Tags">
              <TagsInput value={item.tags} onChange={(tags) => update({ tags })} />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
