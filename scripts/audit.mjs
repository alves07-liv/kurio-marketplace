import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const base = 'http://127.0.0.1:4173'
const out = 'artifacts/lighthouse-optimized'
await mkdir(out, { recursive: true })
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1'], { stdio: 'ignore' })
async function ready() {
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await fetch(base).catch(() => null))?.ok) return
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Preview não iniciou na porta 4173')
}
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)] }
try {
  await ready()
  const summary = {}
  for (const profile of ['mobile', 'desktop']) {
    for (const [page, path] of [['home', '/'], ['detail', '/nft/042']]) {
      const reports = []
      for (let run = 1; run <= 3; run++) {
        const output = join(out, `${profile}-${page}-${run}`)
        const args = ['node_modules/lighthouse/cli/index.js', `${base}${path}`, '--only-categories=performance,accessibility,best-practices,seo', '--output=json', '--output=html', `--output-path=${output}`, '--chrome-flags=--headless --no-sandbox', '--quiet']
        if (profile === 'desktop') args.push('--preset=desktop')
        let result = { stderr: '', error: undefined }
        try { await readFile(`${output}.report.json`, 'utf8') }
        catch { result = spawnSync(process.execPath, args, { timeout: 60000, encoding: 'utf8' }) }
        let report
        try { report = JSON.parse(await readFile(`${output}.report.json`, 'utf8')) }
        catch { throw new Error(`${profile} ${page} ${run}: ${result.stderr || result.error?.message || 'sem relatório'}`) }
        reports.push({ performance: report.categories.performance.score * 100, accessibility: report.categories.accessibility.score * 100, bestPractices: report.categories['best-practices'].score * 100, seo: report.categories.seo.score * 100, lcp: report.audits['largest-contentful-paint'].numericValue, cls: report.audits['cumulative-layout-shift'].numericValue, tbt: report.audits['total-blocking-time'].numericValue })
        console.log(`${profile} ${page} ${run}/3 concluído`)
      }
      summary[`${profile}-${page}`] = Object.fromEntries(Object.keys(reports[0]).map(key => [key, median(reports.map(report => report[key]))]))
    }
  }
  await writeFile(join(out, 'summary.json'), JSON.stringify({ date: new Date().toISOString(), node: process.version, lighthouse: '12.6.1', conditions: 'Chrome local, Lighthouse padrão, build Vite preview', medians: summary }, null, 2))
  console.log(summary)
} finally { server.kill() }
