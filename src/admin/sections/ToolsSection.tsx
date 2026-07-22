import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { ArrayEditor } from '../ui/ArrayEditor'

export function ToolsSection({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Tools &amp; Technologies</h2>
      <ArrayEditor
        items={content.tools}
        itemLabel="Tool"
        onChange={(tools) => onChange({ tools })}
        makeItem={() => ({
          id: `tool-${Date.now()}`,
          label: 'New Tool',
          abbr: '?',
          color: '#3b82f6',
        })}
        renderItem={(item, update) => (
          <div className="grid grid-cols-4 gap-3">
            <Field label="Label">
              <TextInput value={item.label} onChange={(e) => update({ label: e.target.value })} />
            </Field>
            <Field label="Badge text" hint="1-2 chars/emoji">
              <TextInput
                maxLength={4}
                value={item.abbr}
                onChange={(e) => update({ abbr: e.target.value })}
              />
            </Field>
            <div className="col-span-2">
              <Field label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) => update({ color: e.target.value })}
                    className="h-9 w-10 shrink-0 rounded-lg border border-[var(--border-1)] bg-transparent"
                  />
                  <TextInput
                    value={item.color}
                    onChange={(e) => update({ color: e.target.value })}
                  />
                </div>
              </Field>
            </div>
          </div>
        )}
      />
    </div>
  )
}
