import { Card, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tooltip } from '../../../components/ui/tooltip';
import Logo from '../../../components/brand/Logo';

export const dynamic = 'force-dynamic';

export default function BrandPreview() {
  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 16 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <Logo title="Dixis" />
        <Button>Primary CTA</Button>
      </header>

      <Card>
        <CardTitle>Brand Tokens</CardTitle>
        <div
          style={{
            marginTop: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12
          }}
        >
          <div
            style={{
              background: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground)',
              padding: 12,
              borderRadius: 8
            }}
          >
            Primary
          </div>
          <div
            style={{
              background: 'var(--brand-accent)',
              color: '#fff',
              padding: 12,
              borderRadius: 8
            }}
          >
            Accent
          </div>
          <div
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              boxShadow:
                '0 1px 1px rgba(0,0,0,.04), 0 2px 4px rgba(0,0,0,.06)'
            }}
          >
            Surface
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Tooltip summary="Γιατί;">
            Οι tokens προέρχονται από Tailwind config & CSS vars για εύκολο
            theming.
          </Tooltip>
        </div>
      </Card>
    </main>
  );
}
