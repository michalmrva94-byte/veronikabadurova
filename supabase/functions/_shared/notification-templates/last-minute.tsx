import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section, Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface Props {
  clientName: string;
  title: string;
  message: string;
  appUrl: string;
  slotId?: string;
}

export const LastMinuteEmail = ({ clientName, title, message, appUrl, slotId }: Props) => (
  <Html>
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{title}</Heading>
        <Text style={text}>Ahoj {clientName},</Text>
        <Text style={text}>{message}</Text>
        <Section style={buttonContainer}>
          <Button style={button} href={`${appUrl}${slotId ? `/last-minute?slot=${slotId}` : '/last-minute'}`}>
            Rezervovať teraz
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Veronika Swim · veronikaswim.sk</Text>
      </Container>
    </Body>
  </Html>
)

export default LastMinuteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }
const container = { padding: '40px 20px', margin: '0 auto', maxWidth: '480px' }
const h1 = { color: '#333', fontSize: '22px', fontWeight: 'bold' as const, margin: '0 0 24px' }
const text = { color: '#333', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const button = { backgroundColor: 'hsl(170, 50%, 45%)', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, textDecoration: 'none', textAlign: 'center' as const, padding: '12px 32px', borderRadius: '12px' }
const hr = { borderColor: '#eee', margin: '32px 0' }
const footer = { color: '#999', fontSize: '12px', textAlign: 'center' as const }
