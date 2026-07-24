import type { SiteContent, SocialLink } from '../../types/content'
import { Field, TextInput, TextArea, SelectInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function ContactSocialSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  const contact = content.contact
  const update = (patch: Partial<SiteContent['contact']>) =>
    onChange({ contact: { ...contact, ...patch } })

  const footerLinks = content.footerLinks
  const updateFooterLinks = (patch: Partial<SiteContent['footerLinks']>) =>
    onChange({ footerLinks: { ...footerLinks, ...patch } })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <TextInput value={contact.heading} onChange={(e) => update({ heading: e.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput value={contact.email} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field label="Location">
            <TextInput
              value={contact.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Subheading">
              <TextArea
                rows={2}
                value={contact.subheading}
                onChange={(e) => update({ subheading: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Social Links</h2>
        <ArrayEditor
          items={content.social}
          itemLabel="Link"
          onChange={(social) => onChange({ social })}
          makeItem={(): SocialLink => ({ id: `social-${Date.now()}`, type: 'other', url: '' })}
          renderItem={(item, update) => (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Type">
                <SelectInput
                  value={item.type}
                  onChange={(e) => update({ type: e.target.value as SocialLink['type'] })}
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="other">Other</option>
                </SelectInput>
              </Field>
              <div className="col-span-2">
                <Field label="URL">
                  <TextInput value={item.url} onChange={(e) => update({ url: e.target.value })} />
                </Field>
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Footer Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Resume URL" hint="Leave empty to hide">
            <TextInput
              value={footerLinks.resumeUrl}
              onChange={(e) => updateFooterLinks({ resumeUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field label="ORCID URL" hint="Leave empty to hide">
            <TextInput
              value={footerLinks.orcidUrl}
              onChange={(e) => updateFooterLinks({ orcidUrl: e.target.value })}
              placeholder="https://orcid.org/..."
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
