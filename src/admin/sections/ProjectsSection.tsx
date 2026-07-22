import type { SiteContent, Project } from '../../types/content'
import { Field, TextInput, TextArea, SelectInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'
import { TagsInput } from '../ui/TagsInput'

export function ProjectsSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Section title">
          <TextInput
            value={content.projectsTitle}
            onChange={(e) => onChange({ projectsTitle: e.target.value })}
          />
        </Field>
        <Field label="Section subtitle">
          <TextInput
            value={content.projectsSubtitle}
            onChange={(e) => onChange({ projectsSubtitle: e.target.value })}
          />
        </Field>
        <Field label="'View all' label">
          <TextInput
            value={content.projectsCtaLabel}
            onChange={(e) => onChange({ projectsCtaLabel: e.target.value })}
          />
        </Field>
        <Field label="'View all' link" hint="Leave empty to hide the link">
          <TextInput
            value={content.projectsCtaHref}
            onChange={(e) => onChange({ projectsCtaHref: e.target.value })}
          />
        </Field>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Projects</h2>
        <ArrayEditor
          items={content.projects}
          itemLabel="Project"
          onChange={(projects) => onChange({ projects })}
          makeItem={(): Project => ({
            id: `proj-${Date.now()}`,
            category: 'Category',
            title: 'New Project',
            description: '',
            tags: [],
            link: '',
            accent: 'blue',
          })}
          renderItem={(item, update) => (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Category">
                  <TextInput
                    value={item.category}
                    onChange={(e) => update({ category: e.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Title">
                    <TextInput
                      value={item.title}
                      onChange={(e) => update({ title: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Description">
                <TextArea
                  rows={3}
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Link" hint="Leave empty for no external link">
                  <TextInput value={item.link} onChange={(e) => update({ link: e.target.value })} />
                </Field>
                <Field label="Accent color">
                  <SelectInput
                    value={item.accent}
                    onChange={(e) =>
                      update({ accent: e.target.value as SiteContent['projects'][number]['accent'] })
                    }
                  >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                  </SelectInput>
                </Field>
              </div>
              <Field label="Tags">
                <TagsInput value={item.tags} onChange={(tags) => update({ tags })} />
              </Field>
            </div>
          )}
        />
      </div>
    </div>
  )
}
