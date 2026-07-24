import type { SiteContent } from '../../types/content'
import { Field, TextInput, SelectInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'
import { iconOptions } from '../../data/icons'

export function SpecializationsSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Core Expertise</h2>
      <ArrayEditor
        items={content.specializations}
        itemLabel="Specialization"
        onChange={(specializations) => onChange({ specializations })}
        makeItem={() => ({ id: `spec-${Date.now()}`, icon: 'cog', label: 'New Specialization' })}
        renderItem={(item, update) => (
          <div className="grid grid-cols-3 gap-3">
            <Field label="Icon">
              <SelectInput value={item.icon} onChange={(e) => update({ icon: e.target.value })}>
                {iconOptions.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <div className="col-span-2">
              <Field label="Label">
                <TextInput value={item.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
            </div>
          </div>
        )}
      />
    </div>
  )
}
