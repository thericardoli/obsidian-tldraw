declare module '*.css' {
  const content: string
  export default content
}

// Allow side-effect CSS imports like `import 'tldraw/tldraw.css'`
declare module 'tldraw/tldraw.css'
