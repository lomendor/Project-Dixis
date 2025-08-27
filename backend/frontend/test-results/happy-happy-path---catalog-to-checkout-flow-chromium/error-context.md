# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "Project Dixis" [ref=e7] [cursor=pointer]:
          - /url: /
        - link "Products" [ref=e10] [cursor=pointer]:
          - /url: /
        - generic [ref=e12]:
          - link "Login" [ref=e13] [cursor=pointer]:
            - /url: /auth/login
          - link "Sign Up" [ref=e14] [cursor=pointer]:
            - /url: /auth/register
    - main [ref=e15]:
      - generic [ref=e16]:
        - heading "Fresh Products from Local Producers" [level=1] [ref=e17]
        - generic [ref=e18]:
          - textbox "Search products..." [ref=e20]
          - combobox [ref=e22]:
            - option "All Categories" [selected]
      - generic [ref=e23]:
        - img [ref=e25]
        - heading "Unable to load products" [level=3] [ref=e27]
        - paragraph [ref=e28]: The route api/v1/api/v1/public/products could not be found.
        - button "Try Again" [ref=e29]
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - img [ref=e36] [cursor=pointer]
  - alert [ref=e39]: Fresh Products from Local Producers
```