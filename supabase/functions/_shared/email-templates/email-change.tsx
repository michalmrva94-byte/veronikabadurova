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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="sk" dir="ltr">
    <Head />
    <Preview>Potvrdenie zmeny emailu pre Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🏊‍♀️ Veronika Swim</Text>
        <Heading style={h1}>Zmena emailovej adresy</Heading>
        <Text style={text}>
          Požiadali ste o zmenu emailovej adresy z{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          na{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Kliknite na tlačidlo nižšie pre potvrdenie tejto zmeny:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Potvrdiť zmenu emailu
        </Button>
        <Text style={footer}>
          Ak ste o túto zmenu nežiadali, zabezpečte si prosím ihneď svoj účet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
