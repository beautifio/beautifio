export function generateNickname(): string {
  const adjectives = ['Manis', 'Berani', 'Tenang', 'Ceria', 'Bijak', 'Hangat', 'Cerah', 'Kuat']
  const nouns = ['Bintang', 'Bulan', 'Angin', 'Awan', 'Mentari', 'Hujan', 'Fajar', 'Langit']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${adj}${noun}${num}`
}
