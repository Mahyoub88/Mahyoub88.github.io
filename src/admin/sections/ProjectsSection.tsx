import type {
  SiteContent,
  Project,
  ProjectLink,
  ProjectMeta,
  ProjectStatusKind,
} from '../../types/content'
import { Field, TextInput, TextArea, SelectInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'
import { TagsInput } from '../ui/TagsInput'

// Links and meta rows are edited as "Label | value" lines. It keeps the form
// compact, and a line missing its separator is dropped rather than saved broken.
function parsePairs(text: string): { label: string; value: string }[] {
  return text
    .split('\n')
    .map((line) => {
      const i = line.indexOf('|')
      if (i === -1) return null
      const label = line.slice(0, i).trim()
      const value = line.slice(i + 1).trim()
      return label && value ? { label, value } : null
    })
    .filter((p): p is { label: string; value: string } => p !== null)
}

const linksToText = (links: ProjectLink[] = []) =>
  links.map((l) => `${l.label} | ${l.href}`).join('\n')

const metaToText = (meta: ProjectMeta[] = []) =>
  meta.map((m) => `${m.label} | ${m.value}`).join('\n')

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
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Projects</h2>
        <ArrayEditor
          items={content.projects}
          itemLabel="Project"
          onChange={(projects) => onChange({ projects })}
          makeItem={(): Project => ({
            id: `proj-${Date.now()}`,
            group: 'selected',
            category: 'Category',
            title: 'New Project',
            subtitle: '',
            description: '',
            meta: [],
            tags: [],
            link: '',
            links: [],
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

              <Field label="Subtitle" hint="Optional line under the title">
                <TextInput
                  value={item.subtitle ?? ''}
                  onChange={(e) => update({ subtitle: e.target.value })}
                />
              </Field>

              <Field label="Description">
                <TextArea
                  rows={3}
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </Field>

              <Field
                label="Problem / Role / Method / Result"
                hint="One row per line as: Label | text. Leave out any row you cannot state accurately."
              >
                <TextArea
                  rows={4}
                  value={metaToText(item.meta)}
                  onChange={(e) => update({ meta: parsePairs(e.target.value) as ProjectMeta[] })}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Section">
                  <SelectInput
                    value={item.group ?? 'selected'}
                    onChange={(e) => update({ group: e.target.value as Project['group'] })}
                  >
                    <option value="selected">Selected Work</option>
                    <option value="earlier">Earlier Engineering Work</option>
                  </SelectInput>
                </Field>
                <Field label="Status badge type">
                  <SelectInput
                    value={item.status?.kind ?? ''}
                    onChange={(e) =>
                      update({
                        status: e.target.value
                          ? {
                              kind: e.target.value as ProjectStatusKind,
                              label: item.status?.label ?? '',
                            }
                          : undefined,
                      })
                    }
                  >
                    <option value="">No badge</option>
                    <option value="public">Public Repository</option>
                    <option value="academic">Academic Research</option>
                    <option value="professional">Professional Case Study</option>
                  </SelectInput>
                </Field>
                <Field label="Accent color">
                  <SelectInput
                    value={item.accent}
                    onChange={(e) => update({ accent: e.target.value as Project['accent'] })}
                  >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="amber">Amber</option>
                  </SelectInput>
                </Field>
              </div>

              {item.status && (
                <Field label="Status badge text">
                  <TextInput
                    value={item.status.label}
                    onChange={(e) =>
                      update({ status: { kind: item.status!.kind, label: e.target.value } })
                    }
                  />
                </Field>
              )}

              <Field
                label="Buttons"
                hint="One per line as: Label | https://… Each must point at the specific page, not a profile."
              >
                <TextArea
                  rows={2}
                  value={linksToText(item.links)}
                  onChange={(e) =>
                    update({
                      links: parsePairs(e.target.value).map(
                        ({ label, value }): ProjectLink => ({ label, href: value }),
                      ),
                    })
                  }
                />
              </Field>

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
