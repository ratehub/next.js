class UrlNode {
  placeholder: boolean = true
  children: Map<string, UrlNode> = new Map()
  slugName: string | null = null
  restSlugName: string | null = null
  optionalRestSlugName: string | null = null

  insert(urlPath: string): void {
    this._insert(urlPath.split('/').filter(Boolean), [], false)
  }

  smoosh(): string[] {
    return this._smoosh()
  }

  private _smoosh(prefix: string = '/'): string[] {
    const childrenPaths = [...this.children.keys()].sort()
    if (this.slugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[]'), 1)
    }
    if (this.restSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[...]'), 1)
    }
    if (this.optionalRestSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[[...]]'), 1)
    }

    const routes = childrenPaths
      .map((c) => this.children.get(c)!._smoosh(`${prefix}${c}/`))
      .reduce((prev, curr) => [...prev, ...curr], [])

    if (this.slugName !== null) {
      routes.push(
        ...this.children.get('[]')!._smoosh(`${prefix}[${this.slugName}]/`)
      )
    }

    if (!this.placeholder) {
      const r = prefix === '/' ? '/' : prefix.slice(0, -1)
      if (this.optionalRestSlugName != null) {
        throw new Error(
          `You cannot define a route with the same specificity as a optional catch-all route ("${r}" and "${r}[[...${this.optionalRestSlugName}]]").`
        )
      }

      routes.unshift(r)
    }

    if (this.restSlugName !== null) {
      routes.push(
        ...this.children
          .get('[...]')!
          ._smoosh(`${prefix}[...${this.restSlugName}]/`)
      )
    }

    if (this.optionalRestSlugName !== null) {
      routes.push(
        ...this.children
          .get('[[...]]')!
          ._smoosh(`${prefix}[[...${this.optionalRestSlugName}]]/`)
      )
    }

    return routes
  }

  private _insert(
    urlPaths: string[],
    slugNames: string[],
    isCatchAll: boolean
  ): void {
    if (urlPaths.length === 0) {
      this.placeholder = false
      return
    }

    if (isCatchAll) {
      throw new Error(`Catch-all must be the last part of the URL.`)
    }

    // The next segment in the urlPaths list
    let nextSegment = urlPaths[0]

    // If this UrlNode doesn't have the nextSegment yet we create a new child UrlNode
    if (!this.children.has(nextSegment)) {
      this.children.set(nextSegment, new UrlNode())
    }

    this.children
      .get(nextSegment)!
      ._insert(urlPaths.slice(1), slugNames, isCatchAll)
  }
}

export function getSortedRoutes(normalizedPages: string[]): string[] {
  // First the UrlNode is created, and every UrlNode can have only 1 dynamic segment
  // Eg you can't have pages/[post]/abc.js and pages/[hello]/something-else.js
  // Only 1 dynamic segment per nesting level

  // So in the case that is test/integration/dynamic-routing it'll be this:
  // pages/[post]/comments.js
  // pages/blog/[post]/comment/[id].js
  // Both are fine because `pages/[post]` and `pages/blog` are on the same level
  // So in this case `UrlNode` created here has `this.slugName === 'post'`
  // And since your PR passed through `slugName` as an array basically it'd including it in too many possibilities
  // Instead what has to be passed through is the upwards path's dynamic names
  const root = new UrlNode()

  // Here the `root` gets injected multiple paths, and insert will break them up into sublevels
  normalizedPages.forEach((pagePath) => root.insert(pagePath))
  // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
  return root.smoosh()
}
