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
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Bestätige deine E-Mail für Pendly</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brand}>
          <Text style={brandText}>Pendly</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Willkommen bei Pendly</Heading>
          <Text style={text}>
            Schön, dass du dabei bist! Bestätige bitte deine E-Mail-Adresse{' '}
            <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>, um loszulegen.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>E-Mail bestätigen</Button>
          </Section>
          <Text style={smallText}>Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</Text>
          <Text style={linkFallback}>{confirmationUrl}</Text>
        </Section>
        <Text style={footer}>
          Du hast kein Konto bei <Link href={siteUrl} style={footerLink}>{siteName}</Link> erstellt? Dann ignoriere diese E-Mail einfach.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif', padding: '40px 0' }
const container = { maxWidth: '480px', margin: '0 auto', padding: '0 20px' }
const brand = { textAlign: 'center' as const, marginBottom: '24px' }
const brandText = { fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif', fontSize: '24px', fontWeight: 800 as const, color: '#1E4ED8', letterSpacing: '-0.02em', margin: 0 }
const card = { backgroundColor: '#FDF8F2', border: '1.5px solid #EDE4D8', borderRadius: '20px', padding: '36px 32px' }
const h1 = { fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif', fontSize: '24px', fontWeight: 800 as const, color: '#1C1917', letterSpacing: '-0.02em', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#1C1917', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: '#1E4ED8', textDecoration: 'underline' }
const buttonWrap = { textAlign: 'center' as const, margin: '8px 0 28px' }
const button = { backgroundColor: '#1E4ED8', color: '#ffffff', fontSize: '15px', fontWeight: 600 as const, borderRadius: '999px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '13px', color: '#78716C', lineHeight: '1.5', margin: '0 0 6px' }
const linkFallback = { fontSize: '12px', color: '#1E4ED8', wordBreak: 'break-all' as const, margin: 0 }
const footer = { fontSize: '12px', color: '#78716C', textAlign: 'center' as const, margin: '24px 0 0', lineHeight: '1.5' }
const footerLink = { color: '#78716C', textDecoration: 'underline' }
