export type TemplateName = 'assignment_reminder'

export interface RenderedMessage {
  subject: string
  text: string
  html?: string
}

const templates: Record<TemplateName, { subject: string; text: string; html?: string; description: string; fields: string[] }> = {
  assignment_reminder: {
    subject: 'Reminder: {{assignment_name}} due {{due_at}}',
    text: `Hi{{#user_name}} {{user_name}}{{/user_name}},\n\nThis is a reminder that "{{assignment_name}}" in {{course_name}} is due on {{due_at}}.\n\nLink: {{assignment_url}}\n\nGood luck!\n`,
    html: `<!doctype html><html><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5;">\n  <p>Hi{{#user_name}} {{user_name}}{{/user_name}},</p>\n  <p>This is a reminder that <strong>"{{assignment_name}}"</strong> in <strong>{{course_name}}</strong> is due on <strong>{{due_at}}</strong>.</p>\n  <p>Link: <a href="{{assignment_url}}">Open assignment</a></p>\n  <p>Good luck!</p>\n</body></html>`,
    description: 'Reminder email for an upcoming assignment due date',
    fields: ['user_name?', 'course_name', 'assignment_name', 'due_at', 'assignment_url?']
  }
}

function replaceVars(tpl: string, vars: Record<string, any>): string {
  // Support simple conditional sections like {{#name}} ... {{/name}}
  tpl = tpl.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/(\w+)\}\}/g, (_, name: string, content: string, end: string) => {
    if (name !== end) return ''
    const v = vars?.[name]
    return v ? content : ''
  })
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const v = vars?.[name]
    return v == null ? '' : String(v)
  })
}

export function renderTemplate(name: TemplateName, vars: Record<string, any>): RenderedMessage {
  const tpl = templates[name]
  if (!tpl) throw new Error(`unknown template: ${name}`)
  const subject = replaceVars(tpl.subject, vars)
  const text = replaceVars(tpl.text, vars)
  const html = tpl.html ? replaceVars(tpl.html, vars) : undefined
  return { subject, text, html }
}

export function listTemplates() {
  return Object.entries(templates).map(([key, v]) => ({
    name: key as TemplateName,
    description: v.description,
    fields: v.fields,
  }))
}

