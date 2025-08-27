# Page snapshot

```yaml
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
    - paragraph [ref=e25]: Loading fresh products...
```