/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="sk" dir="ltr">
    <Head />
    <Preview>Pozvánka do Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🏊‍♀️ Veronika Swim</Text>
        <Heading style={h1}>Boli ste pozvaní</Heading>
        <Text style={text}>
          Dostali ste pozvánku do{' '}
          <Link href={siteUrl} style={link}>
            <strong>Veronika Swim</strong>
          </Link>
          . Kliknite na tlačidlo nižšie, prijmite pozvánku a vytvorte si účet.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Prijať pozvánku
        </Button>
        <Text style={footer}>
          Ak ste túto pozvánku nečakali, môžete tento email pokojne ignorovať.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }
const container = { padding: '30px 25px' }
const brand = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: 'hsl(170, 50%, 45%)',
  margin: '0 0 24px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(0, 0%, 10%)',
  margin: '0 0 20px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: 'hsl(0, 0%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: 'hsl(170, 50%, 45%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(0, 0%, 10%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '20px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 65%)', margin: '30px 0 0' }
