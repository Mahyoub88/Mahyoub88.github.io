import type { SiteContent, AboutCard } from '../../types/content'
import { Field, TextInput, TextArea } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function AboutSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  const about = content.about
  const update = (patch: Partial<SiteContent['about']>) =>
    onChange({ about: { ...about, ...patch } })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-1)]">About</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Heading">
          <TextInput value={about.heading} onChange={(e) => update({ heading: e.target.value })} />
        </Field>
        <Field label="Subheading" hint="Leave empty to hide">
          <TextInput
            value={about.subheading}
            onChange={(e) => update({ subheading: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Paragraphs" hint="One paragraph per line">
        <TextArea
          rows={8}
          value={about.paragraphs.join('\n')}
          onChange={(e) => update({ paragraphs: e.target.value.split('\n').filter((p) => p.trim()) })}
        />
      </Field>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-1)]">Capability cards</h3>
        <ArrayEditor
          items={about.cards ?? []}
          itemLabel="Card"
          onChange={(cards) => update({ cards })}
          makeItem={(): AboutCard => ({
            id: `about-card-${Date.now()}`,
            title: 'New capability',
            description: '',
          })}
          renderItem={(card, updateCard) => (
            <div className="space-y-3">
              <Field label="Title">
                <TextInput
                  value={card.title}
                  onChange={(e) => updateCard({ title: e.target.value })}
                />
              </Field>
              <Field label="Description">
                <TextArea
                  rows={2}
                  value={card.description}
                  onChange={(e) => updateCard({ description: e.target.value })}
                />
              </Field>
            </div>
          )}
        />
      </div>
    </div>
  )
}
