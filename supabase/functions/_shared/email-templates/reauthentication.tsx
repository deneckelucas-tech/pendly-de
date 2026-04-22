/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Bestätigungscode für Pendly</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brand}>
          <Text style={brandText}>Pendly</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Identität bestätigen</Heading>
          <Text style={text}>Verwende diesen Code, um deine Identität zu bestätigen:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={smallText}>Der Code ist nur kurze Zeit gültig.</Text>
        </Section>
        <Text style={footer}>
          Du hast diese Bestätigung nicht angefragt? Dann ignoriere diese E-Mail einfach.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif', padding: '40px 0' }
const container = { maxWidth: '480px', margin: '0 auto', padding: '0 20px' }
const brand = { textAlign: 'center' as const, marginBottom: '24px' }
const brandText = { fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif', fontSize: '24px', fontWeight: 800 as const, color: '#1E4ED8', letterSpacing: '-0.02em', margin: 0 }
const card = { backgroundColor: '#FDF8F2', border: '1.5px solid #EDE4D8', borderRadius: '20px', padding: '36px 32px', textAlign: 'center' as const }
const h1 = { fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif', fontSize: '24px', fontWeight: 800 as const, color: '#1C1917', letterSpacing: '-0.02em', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#1C1917', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = { fontFamily: '"Plus Jakarta Sans", -apple-system, sans-serif', fontSize: '32px', fontWeight: 800 as const, color: '#1E4ED8', letterSpacing: '0.2em', margin: '0 0 20px' }
const smallText = { fontSize: '13px', color: '#78716C', lineHeight: '1.5', margin: 0 }
const footer = { fontSize: '12px', color: '#78716C', textAlign: 'center' as const, margin: '24px 0 0', lineHeight: '1.5' }
