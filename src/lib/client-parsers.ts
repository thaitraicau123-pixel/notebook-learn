import JSZip from 'jszip'; export async function parsePptxInBrowser(file: File): Promise<string> { const arrayBuffer = await file.arrayBuffer(); const zip = await JSZip.loadAsync(arrayBuffer); const slideFiles = Object.keys(zip.files)
.filter((name) => /ppt\/slides\/slide\d+\.xml$/i.test(name))
.sort((a, b) => { const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10); const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10); return numA - numB; }); const slides: string[] = []; for (let i = 0; i < slideFiles.length; i++) { const slideXml = await zip.files[slideFiles[i]].async('text');
const textMatches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi); if (textMatches && textMatches.length > 0) { const textContent = textMatches
.map((tag) => tag.replace(/<a:t[^>]*>|<\/a:t>/gi, ''))
.filter((t) => t.trim().length > 0)
.join(' '); if (textContent.trim()) { slides.push(`### [Slide ${i + 1}]\n${textContent}`); } } } if (slides.length === 0) { const allXmlFiles = Object.keys(zip.files).filter(
(n) => n.endsWith('.xml') && !n.includes('_rels')
); for (const xmlName of allXmlFiles) { const xml = await zip.files[xmlName].async('text'); const matches = xml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi); if (matches && matches.length > 0) { const text = matches
.map((tag) => tag.replace(/<a:t[^>]*>|<\/a:t>/gi, ''))
.filter((t) => t.trim().length > 0)
.join(' '); if (text.trim()) slides.push(text); } } } return slides.join('\n\n'); }