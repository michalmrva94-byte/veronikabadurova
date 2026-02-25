import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section, Link,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface Props {
  clientName: string;
  trainingDate: string;
  trainingTime: string;
  trainingCount?: number;
  appUrl: string;
}

export const ProposalEmail = ({ clientName, trainingDate, trainingTime, trainingCount, appUrl }: Props) => (
  <Html>
    <Head />
    <Preview>Nový navrhnutý tréning — Veronika Swim</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nový navrhnutý tréning 📋</Heading>
        <Text style={text}>Ahoj {clientName},</Text>
        {trainingCount && trainingCount > 1 ? (
          <Text style={text}>
            Veronika ti navrhla <strong>{trainingCount} tréningov</strong>. Prvý je naplánovaný na <strong>{trainingDate}</strong> o <strong>{trainingTime}</strong>. Potvrď ich, prosím, do 24 hodín.
          </Text>
        ) : (
          <Text style={text}>
            Veronika ti navrhla tréning na <strong>{trainingDate}</strong> o <strong>{trainingTime}</strong>. Potvrď ho, prosím, do 24 hodín.
          </Text>
        )}
        <Section style={warningBox}>
          <Text style={warningText}>⏰ Máš 24 hodín na potvrdenie, inak sa termín automaticky uvoľní.</Text>
        </Section>
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

export default ProposalEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif" }
const container = { padding: '40px 20px', margin: '0 auto', maxWidth: '480px' }
const h1 = { color: '#333', fontSize: '22px', fontWeight: 'bold' as const, margin: '0 0 24px' }
const text = { color: '#333', fontSize: '15px', lineHeight: '24px', margin: '0 0 16px' }
const warningBox = { backgroundColor: '#FFF8E1', borderRadius: '12px', padding: '16px', margin: '24px 0' }
const warningText = { color: '#F57F17', fontSize: '14px', margin: '0', fontWeight: '500' as const }
const buttonContainer = { textAlign: 'center' as const, margin: '32px 0' }
const buttonTd = { backgroundColor: 'hsl(170, 50%, 45%)', borderRadius: '12px', padding: '12px 32px' }
const buttonLink = { color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#eee', margin: '32px 0' }
const footer = { color: '#999', fontSize: '12px', textAlign: 'center' as const }
