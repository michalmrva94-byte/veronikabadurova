/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="sk" dir="ltr">
    <Head />
    <Preview>Váš overovací kód pre Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🏊‍♀️ Veronika Swim</Text>
        <Heading style={h1}>Overovací kód</Heading>
        <Text style={text}>Použite tento kód na overenie svojej identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Platnosť kódu je obmedzená. Ak ste o tento kód nežiadali, môžete
          tento email pokojne ignorovať.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: 'hsl(0, 0%, 10%)',
  margin: '0 0 30px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: 'hsl(0, 0%, 65%)', margin: '30px 0 0' }
