import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface Props {
  clientName: string;
  trainingDate: string;
  trainingTime: string;
  reason?: string;
  cancelledBy: 'admin' | 'client';
  cancellationFee?: string;
  appUrl: string;
}

export const CancellationEmail = ({ clientName, trainingDate, trainingTime, reason, cancelledBy, cancellationFee, appUrl }: Props) => (
  <Html>
    <Head />
    <Preview>Tréning zrušený — Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Tréning zrušený ❌</Heading>
        <Text style={text}>Ahoj {clientName},</Text>
        {cancelledBy === 'admin' ? (
          <Text style={text}>
            tréning na <strong>{trainingDate}</strong> o <strong>{trainingTime}</strong> bol, žiaľ, zrušený.
            {reason ? ` Dôvod: ${reason}` : ''} Ak máš otázky, neváhaj sa ozvať.
          </Text>
        ) : (
          <Text style={text}>
            tvoj tréning na <strong>{trainingDate}</strong> o <strong>{trainingTime}</strong> bol zrušený.
          </Text>
        )}
        {cancellationFee && (
          <Section style={feeBox}>
            <Text style={feeText}>💰 Storno poplatok: {cancellationFee}</Text>
          </Section>
        )}
        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}/moje-treningy`}>
            Pozrieť tréningy
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Veronika Swim · veronikaswim.sk</Text>
      </Container>
    </Body>
  </Html>
)

export default CancellationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }
const container = { padding: '40px 20px', margin: '0 auto', maxWidth: '480px' }
const h1 = { color: '#333', fontSize: '22px', fontWeight: 'bold' as const, margin: '0 0 24px' }
const text = { color: '#333', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const feeBox = { backgroundColor: '#FFF3E0', borderRadius: '12px', padding: '16px', margin: '24px 0' }
const feeText = { color: '#E65100', fontSize: '14px', margin: '0', fontWeight: '500' as const }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: 'hsl(170, 50%, 45%)', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, textDecoration: 'none', textAlign: 'center' as const, padding: '12px 32px', borderRadius: '12px' }
const hr = { borderColor: '#eee', margin: '32px 0' }
const footer = { color: '#999', fontSize: '12px', textAlign: 'center' as const }
