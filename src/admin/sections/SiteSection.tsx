import type { SiteContent } from '../../types/content'
import { siteSettings } from '../../data/siteSettings'
import { Field, TextInput, TextArea, SelectInput } from '../ui/Field'
import { MediaField } from '../ui/MediaField'
import { ArrayEditor } from '../ui/ArrayEditor'

export function SiteSection({ content, onChange }: { content: SiteContent; onChange: (patch: Partial<SiteContent>) => void }) {
  const settings = siteSettings(content.siteSettings)
  const update = (patch: Partial<typeof settings>) => onChange({ siteSettings: { ...settings, ...patch } })
  return <div className="space-y-6">
    <h2 className="text-lg font-bold text-[var(--text-1)]">Site, Appearance & SEO</h2>
    <fieldset className="space-y-3"><legend className="mb-3 font-semibold">Search & sharing</legend>
      {(['title', 'description', 'socialTitle', 'socialDescription', 'canonicalUrl', 'language', 'locale'] as const).map(key => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}>
        <TextInput value={settings.seo[key]} onChange={event => update({ seo: { ...settings.seo, [key]: event.target.value } })} />
      </Field>)}
      <MediaField label="Social sharing image" value={settings.seo.socialImage} onChange={socialImage => update({ seo: { ...settings.seo, socialImage } })} />
      <MediaField label="Favicon" value={settings.seo.favicon} onChange={favicon => update({ seo: { ...settings.seo, favicon } })} />
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={settings.seo.indexing} onChange={event => update({ seo: { ...settings.seo, indexing: event.target.checked } })} />Allow search engines to index the public site</label>
    </fieldset>
    <fieldset className="space-y-3"><legend className="mb-3 font-semibold">Appearance</legend>
      <Field label="Default theme (visitors can still override)"><SelectInput value={settings.appearance.defaultTheme} onChange={event => update({ appearance: { ...settings.appearance, defaultTheme: event.target.value as 'dark' | 'light' | 'system' } })}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></SelectInput></Field>
      <Field label="Font family"><TextInput value={settings.appearance.fontFamily} onChange={event => update({ appearance: { ...settings.appearance, fontFamily: event.target.value } })} /></Field>
      <div className="grid grid-cols-2 gap-3">{(['accentBlue', 'accentPurple', 'lightBackground', 'darkBackground', 'lightSurface', 'darkSurface'] as const).map(key => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}><input type="color" value={settings.appearance[key]} onChange={event => update({ appearance: { ...settings.appearance, [key]: event.target.value } })} /></Field>)}</div>
      <Field label="Career highlight columns on desktop"><SelectInput value={settings.appearance.statsColumns} onChange={event => update({ appearance: { ...settings.appearance, statsColumns: Number(event.target.value) } })}>{[1, 2, 3, 4, 5, 6].map(number => <option key={number} value={number}>{number}</option>)}</SelectInput></Field>
    </fieldset>
    <fieldset className="space-y-3"><legend className="mb-3 font-semibold">Section headings & footer</legend>
      <p className="text-xs">Leave empty to keep the existing heading.</p>
      {Object.entries(settings.labels).map(([key, value]) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}><TextArea rows={2} value={value} onChange={event => update({ labels: { ...settings.labels, [key]: event.target.value } })} /></Field>)}
    </fieldset>
    <h3 className="font-semibold">Homepage order & visibility</h3>
    <ArrayEditor items={settings.sections} onChange={sections => update({ sections })} itemLabel="Section" makeItem={() => ({ id: 'about' as const, visible: true })} renderItem={(section, change) => <label className="flex gap-3"><input type="checkbox" checked={section.visible} onChange={event => change({ visible: event.target.checked })} />{section.id}</label>} hideAdd hideRemove />
  </div>
}
