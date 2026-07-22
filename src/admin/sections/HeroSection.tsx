import type { SiteContent } from '../../types/content'
import { Field, TextInput, TextArea } from '../ui/Field'

export function HeroSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  const hero = content.hero
  const update = (patch: Partial<SiteContent['hero']>) => onChange({ hero: { ...hero, ...patch } })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-1)]">Hero Section</h2>

      <Field label="Badge text">
        <TextInput value={hero.badge} onChange={(e) => update({ badge: e.target.value })} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <TextInput
            value={hero.greetingName}
            onChange={(e) => update({ greetingName: e.target.value })}
          />
        </Field>
        <Field label="Tagline">
          <TextInput value={hero.tagline} onChange={(e) => update({ tagline: e.target.value })} />
        </Field>
      </div>

      <Field label="Description">
        <TextArea
          rows={4}
          value={hero.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </Field>

      <Field label="Photo URL" hint="Paste a hosted image URL. Leave empty to show placeholder.">
        <TextInput
          value={hero.photoUrl}
          onChange={(e) => update({ photoUrl: e.target.value })}
          placeholder="https://..."
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(['primaryCta', 'secondaryCta', 'tertiaryCta'] as const).map((key) => (
          <div key={key} className="rounded-xl border border-[var(--border-1)] p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--text-3)]">
              {key === 'primaryCta' ? 'Primary Button' : key === 'secondaryCta' ? 'Secondary Button' : 'Tertiary Button'}
            </p>
            <div className="space-y-2">
              <TextInput
                placeholder="Label"
                value={hero[key].label}
                onChange={(e) => update({ [key]: { ...hero[key], label: e.target.value } })}
              />
              <TextInput
                placeholder="Link"
                value={hero[key].href}
                onChange={(e) => update({ [key]: { ...hero[key], href: e.target.value } })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
