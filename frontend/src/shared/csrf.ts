// Django sets this cookie on the session check and rejects a POST without it.
export function csrfToken() {
  return document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '';
}
