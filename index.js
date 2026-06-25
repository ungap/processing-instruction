const { defineProperty } = Object;
const { prototype } = ProcessingInstruction;
const attributes = /(\S+?)=("|')([^\2]*?)\2/g;
const attribute = name => new RegExp(`(\\s*)\\b${name}\\b=("|')([^\\2]*?)\\2`);

// borrowed from html-escaper
const es = /[&<>"']/g;
const cape = c => {
  if (c === '&') return '&amp;';
  if (c === '<') return '&lt;';
  if (c === '>') return '&gt;';
  if (c === '"') return '&quot;';
  return '&#39;';
};

for (const [key, value] of [
  ['hasAttribute', function hasAttribute(name) {
    return attribute(name).test(this.data);
  }],
  ['hasAttributes', function hasAttributes() {
    return !![...this.data.matchAll(attributes)].length;
  }],
  ['getAttribute', function getAttribute(name) {
    return attribute(name).test(this.data) ? RegExp.$3 : null;
  }],
  ['getAttributeNames', function getAttributeNames() {
    return [...this.data.matchAll(attributes)].map(([_, name]) => name);
  }],
  ['removeAttribute', function removeAttribute(name) {
    this.data = this.data.replace(attribute(name), '').trim();
  }],
  ['setAttribute', function setAttribute(name, value) {
    const { data } = this;
    value = String(value).replace(es, cape);
    if (attribute(name).test(data)) {
      const { $1, $2, $3 } = RegExp, prefix = $1 + name + '=' + $2;
      this.data = data.replace(prefix + $3, prefix + value);
    }
    else this.data = data + ` ${name}="${value}"`;
  }],
  ['toggleAttribute', function toggleAttribute(name, force) {
    if (force === undefined) force = !this.hasAttribute(name);
    if (force) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }],
]) {
  if (!(key in prototype)) defineProperty(prototype, key, {
    configurable: true,
    writable: true,
    value
  });
}

const template = document.createElement('template');
template.innerHTML = '<?t ?>';

export default template.content.firstChild.nodeType === Node.COMMENT_NODE ?
  (dom => {
    const tw = document.createTreeWalker(dom, NodeFilter.SHOW_COMMENT);
    let comment;
    while (comment = tw.nextNode()) {
      const { data } = comment;
      if (data.endsWith('?') && /^\?(\S+)/.test(data)) {
        const target = RegExp.$1;
        comment.replaceWith(
          document.createProcessingInstruction(
            target,
            data.slice(1 + target.length, -1).trim()
          )
        );
      }
    }
    return dom;
  }) :
  (dom => dom)
;
