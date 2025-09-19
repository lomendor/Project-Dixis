import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

export default class MyDocument extends Document<{ nonce?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    // Διαβάζουμε το x-nonce από τα response headers, αν υπάρχει
    const nonce = (ctx.res?.getHeader?.('x-nonce') as string) || undefined
    return { ...initialProps, nonce }
  }

  render() {
    // @ts-ignore
    const nonce = (this.props as any).nonce
    return (
      <Html>
        <Head />
        <body>
          <Main />
          {/* NextScript αποδέχεται nonce prop */}
          <NextScript nonce={nonce} />
        </body>
      </Html>
    )
  }
}