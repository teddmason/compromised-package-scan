const Scanner = require('./scanner')
const config = require('./config')

async function main () {
  try {
    // Validate configuration
    if (!config.githubToken) {
      console.error('ERROR: GITHUB_TOKEN not set!')
      console.error('Please create a .env file with your GitHub token.')
      console.error('See .env.example for reference.')
      process.exit(1)
    }

    if (config.repositories.length === 0) {
      console.error('ERROR: No repositories configured!')
      console.error('Please add repositories to scan in config.js')
      process.exit(1)
    }

    // Create and run scanner
    const scanner = new Scanner(config)
    const report = await scanner.run()

    // Save reports to files
    const fs = require('fs')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    // Save detailed JSON report
    const jsonReportPath = `./report-${timestamp}.json`
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2))
    console.log(`\n✓ Detailed JSON report saved to: ${jsonReportPath}`)

    // Save summary report
    const summaryReport = scanner.generateSummaryReport()
    const summaryReportPath = `./summary-${timestamp}.txt`
    fs.writeFileSync(summaryReportPath, summaryReport)
    console.log(`✓ Summary report saved to: ${summaryReportPath}`)

    console.log('\n📄 Share the summary report with management for easy reading.')

    // Exit with appropriate code
    const hasCompromised = report.results.some(r => r.overallStatus === 'COMPROMISED')
    process.exit(hasCompromised ? 1 : 0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the scanner
main()
