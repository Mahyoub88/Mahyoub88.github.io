import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function EducationSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Education</h2>
      <ArrayEditor
        items={content.education}
        itemLabel="Degree"
        onChange={(education) => onChange({ education })}
        makeItem={() => ({
          id: `edu-${Date.now()}`,
          degree: 'New Degree',
          institution: '',
          period: '',
          status: '',
        })}
        renderItem={(item, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Degree">
              <TextInput value={item.degree} onChange={(e) => update({ degree: e.target.value })} />
            </Field>
            <Field label="Institution">
              <TextInput
                value={item.institution}
                onChange={(e) => update({ institution: e.target.value })}
              />
            </Field>
            <Field label="Period">
              <TextInput value={item.period} onChange={(e) => update({ period: e.target.value })} />
            </Field>
            <Field label="Status" hint="e.g. In Progress, Completed">
              <TextInput value={item.status} onChange={(e) => update({ status: e.target.value })} />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
