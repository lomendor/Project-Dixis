# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8] [cursor=pointer]
  - alert [ref=e11]
  - generic [ref=e12]:
    - generic [ref=e14]:
      - link "Project Dixis" [ref=e15] [cursor=pointer]:
        - /url: /
      - heading "Sign in to your account" [level=2] [ref=e16]
      - paragraph [ref=e17]:
        - text: Or
        - link "create a new account" [ref=e18] [cursor=pointer]:
          - /url: /auth/register
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Email address
          - textbox "Email address" [ref=e25]
        - generic [ref=e26]:
          - generic [ref=e27]: Password
          - textbox "Password" [ref=e29]
        - button "Sign in" [ref=e31]
      - link "← Back to Products" [ref=e34] [cursor=pointer]:
        - /url: /
```