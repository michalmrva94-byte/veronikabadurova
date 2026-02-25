import {
  Body, Container, Head, Heading, Html, Link, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface Props {
  clientName: string;
  trainingDate: string;
  trainingTime: string;
  appUrl: string;
}

export const ReminderEmail = ({ clientName, trainingDate, trainingTime, appUrl }: Props) => (
  <Html>
    <Head />
    <Preview>Pripomienka tréningu zajtra — Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Pripomienka tréningu ⏰</Heading>
        <Text style={text}>Ahoj {clientName},</Text>
        <Text style={text}>
          pripomínam ti, že zajtra <strong>{trainingDate}</strong> o <strong>{trainingTime}</strong> máš tréning. Nezabudni si plavky! 🏊‍♀️
        </Text>
        <Section style={buttonContainer}>
          <table cellPadding="0" cellSpacing="0" border={0} style={{ margin: '0 auto' }}>
            <tr>
              <td align="center" style={buttonTd}>
                <Link href={`${appUrl}/moje-treningy`} style={buttonLink}>
                  Pozrieť tréningy
                </Link>
              </td>
            </tr>
          </table>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Veronika Swim · veronikaswim.sk</Text>
      </Container>
    </Body>
  </Html>
)

export default ReminderEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }
const container = { padding: '40px 20px', margin: '0 auto', maxWidth: '480px' }
const h1 = { color: '#333', fontSize: '22px', fontWeight: 'bold' as const, margin: '0 0 24px' }
const text = { color: '#333', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const buttonTd = { backgroundColor: 'hsl(170, 50%, 45%)', borderRadius: '12px', padding: '12px 32px' }
const buttonLink = { color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#eee', margin: '32px 0' }
const footer = { color: '#999', fontSize: '12px', textAlign: 'center' as const }
