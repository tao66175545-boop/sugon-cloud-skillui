/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.css?raw' {
  const src: string
  export default src
}

declare module '*.md?raw' {
  const src: string
  export default src
}