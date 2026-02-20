import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const adminDir = new URL('../', import.meta.url)
const distDir = new URL('./dist/', adminDir)
const assetsDir = new URL('./dist/assets/', adminDir)
const baselinePath = new URL('./bundle-regression-baseline.json', adminDir)
const writeBaseline = process.argv.includes('--write-baseline')

const DEFAULT_ALLOWANCE_PERCENT = 8
const DEFAULT_ALLOWANCE_BYTES = 4096

function normalizeChunkName(fileName) {
  const withoutExt = fileName.replace(/\.(js|css)$/u, '')
  return withoutExt.replace(/-[A-Za-z0-9_-]{8}$/u, '')
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`
}

async function buildSnapshot() {
  const distStats = await stat(distDir).catch(() => null)
  if (!distStats?.isDirectory()) {
    throw new Error('dist folder is missing. Run `pnpm --filter admin build` before bundle checks.')
  }

  const files = await readdir(assetsDir)
  const chunkSizes = {}
  let totalJsGzipBytes = 0
  let totalCssGzipBytes = 0

  for (const fileName of files) {
    if (!fileName.endsWith('.js') && !fileName.endsWith('.css')) {
      continue
    }

    const source = await readFile(new URL(fileName, assetsDir))
    const gzipBytes = gzipSync(source, { level: 9 }).byteLength
    const normalizedName = normalizeChunkName(fileName)

    chunkSizes[normalizedName] = (chunkSizes[normalizedName] ?? 0) + gzipBytes

    if (fileName.endsWith('.js')) {
      totalJsGzipBytes += gzipBytes
    } else {
      totalCssGzipBytes += gzipBytes
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    allowancePercent: DEFAULT_ALLOWANCE_PERCENT,
    allowanceBytes: DEFAULT_ALLOWANCE_BYTES,
    totals: {
      totalJsGzipBytes,
      totalCssGzipBytes,
    },
    chunks: Object.fromEntries(Object.entries(chunkSizes).sort(([a], [b]) => a.localeCompare(b))),
  }
}

function maxAllowedSize(baseSize, allowancePercent, allowanceBytes) {
  return Math.round(baseSize * (1 + allowancePercent / 100) + allowanceBytes)
}

async function main() {
  const snapshot = await buildSnapshot()

  if (writeBaseline) {
    await writeFile(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`)
    console.log(`Wrote baseline snapshot to ${baselinePath.pathname}`)
    console.log(`Total JS gzip: ${formatBytes(snapshot.totals.totalJsGzipBytes)}`)
    console.log(`Total CSS gzip: ${formatBytes(snapshot.totals.totalCssGzipBytes)}`)
    return
  }

  const baselineSource = await readFile(baselinePath, 'utf8').catch(() => null)
  if (!baselineSource) {
    throw new Error('bundle-regression-baseline.json is missing. Run `pnpm --filter admin bundle:baseline`.')
  }

  const baseline = JSON.parse(baselineSource)
  const allowancePercent = Number.isFinite(baseline.allowancePercent)
    ? baseline.allowancePercent
    : DEFAULT_ALLOWANCE_PERCENT
  const allowanceBytes = Number.isFinite(baseline.allowanceBytes)
    ? baseline.allowanceBytes
    : DEFAULT_ALLOWANCE_BYTES

  const failures = []
  const warnings = []

  const currentTotalJs = snapshot.totals.totalJsGzipBytes
  const baselineTotalJs = baseline.totals?.totalJsGzipBytes ?? 0
  const maxTotalJs = maxAllowedSize(baselineTotalJs, allowancePercent, allowanceBytes)

  if (currentTotalJs > maxTotalJs) {
    failures.push(
      `Total JS gzip grew from ${formatBytes(baselineTotalJs)} to ${formatBytes(currentTotalJs)} (max ${formatBytes(maxTotalJs)}).`,
    )
  }

  for (const [chunkName, currentSize] of Object.entries(snapshot.chunks)) {
    const baselineSize = baseline.chunks?.[chunkName]
    if (typeof baselineSize !== 'number') {
      failures.push(`New chunk \`${chunkName}\` detected at ${formatBytes(currentSize)}. Update baseline if expected.`)
      continue
    }

    const maxSize = maxAllowedSize(baselineSize, allowancePercent, allowanceBytes)
    if (currentSize > maxSize) {
      failures.push(
        `Chunk \`${chunkName}\` grew from ${formatBytes(baselineSize)} to ${formatBytes(currentSize)} (max ${formatBytes(maxSize)}).`,
      )
    }
  }

  for (const baselineChunkName of Object.keys(baseline.chunks ?? {})) {
    if (!(baselineChunkName in snapshot.chunks)) {
      warnings.push(`Baseline chunk \`${baselineChunkName}\` is no longer present.`)
    }
  }

  console.log(`Bundle check allowance: +${allowancePercent}% and +${formatBytes(allowanceBytes)} per chunk.`)
  console.log(`Current total JS gzip: ${formatBytes(currentTotalJs)}`)
  console.log(`Current total CSS gzip: ${formatBytes(snapshot.totals.totalCssGzipBytes)}`)

  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }

  if (failures.length > 0) {
    console.error('\nBundle regression check failed:')
    for (const failure of failures) {
      console.error(`- ${failure}`)
    }
    process.exitCode = 1
    return
  }

  console.log('\nBundle regression check passed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
