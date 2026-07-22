import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function BrandNavSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Brand</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name">
            <TextInput
              value={content.brand.name}
              onChange={(e) => onChange({ brand: { ...content.brand, name: e.target.value } })}
            />
          </Field>
          <Field label="Title / Role">
            <TextInput
              value={content.brand.title}
              onChange={(e) => onChange({ brand: { ...content.brand, title: e.target.value } })}
            />
          </Field>
          <Field label="Logo Initial">
            <TextInput
              maxLength={2}
              value={content.brand.logoInitial}
              onChange={(e) =>
                onChange({ brand: { ...content.brand, logoInitial: e.target.value } })
              }
            />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Navigation Links</h2>
        <ArrayEditor
          items={content.nav}
          itemLabel="Link"
          onChange={(nav) => onChange({ nav })}
          makeItem={() => ({ id: `nav-${Date.now()}`, label: 'New Link', href: '#' })}
          renderItem={(item, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Label">
                <TextInput value={item.label} onChange={(e) => update({ label: e.target.value })} />
              </Field>
              <Field label="Link (# anchor or URL)">
                <TextInput value={item.href} onChange={(e) => update({ href: e.target.value })} />
              </Field>
            </div>
          )}
        />
      </div>
    </div>
  )
}
