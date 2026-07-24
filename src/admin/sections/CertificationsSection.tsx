import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function CertificationsSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Certifications &amp; Training</h2>
      <p className="mb-4 text-sm text-[var(--text-3)]">
        This section stays hidden on the site until you add at least one entry.
      </p>
      <ArrayEditor
        items={content.certifications}
        itemLabel="Certification"
        onChange={(certifications) => onChange({ certifications })}
        makeItem={() => ({
          id: `cert-${Date.now()}`,
          name: 'New Certification',
          issuer: '',
          date: '',
          type: '',
        })}
        renderItem={(item, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name">
              <TextInput value={item.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Issuer">
              <TextInput value={item.issuer} onChange={(e) => update({ issuer: e.target.value })} />
            </Field>
            <Field label="Date">
              <TextInput value={item.date} onChange={(e) => update({ date: e.target.value })} />
            </Field>
            <Field label="Type" hint="e.g. Certification, Training, Safety">
              <TextInput value={item.type} onChange={(e) => update({ type: e.target.value })} />
            </Field>
          </div>
        )}
      />
    </div>
  )
}
