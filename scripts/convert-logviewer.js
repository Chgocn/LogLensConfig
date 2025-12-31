#!/usr/bin/env node
/**
 * LogViewer Filter Converter
 * 
 * Converts filter files from tibagni/LogViewer format to community-packs format.
 * 
 * LogViewer format (per line):
 *   name,base64(pattern),flags,R:G:B[,verbosity]
 * 
 * Usage:
 *   node convert-logviewer.js <input.filter> [options]
 * 
 * Options:
 *   --output, -o     Output file path (default: input_converted.json)
 *   --pack-id        Pack ID (default: derived from input filename)
 *   --pack-name      Pack display name
 *   --author         Author name (default: "unknown")
 *   --tags           Comma-separated tags (default: "custom:logviewer")
 *   --group          Group name for filters (creates a filter group)
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        input: null,
        output: null,
        packId: null,
        packName: null,
        author: 'unknown',
        tags: ['custom:logviewer'],
        group: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--output' || arg === '-o') {
            options.output = args[++i];
        } else if (arg === '--pack-id') {
            options.packId = args[++i];
        } else if (arg === '--pack-name') {
            options.packName = args[++i];
        } else if (arg === '--author') {
            options.author = args[++i];
        } else if (arg === '--tags') {
            options.tags = args[++i].split(',').map(t => t.trim());
        } else if (arg === '--group') {
            options.group = args[++i];
        } else if (!arg.startsWith('-')) {
            options.input = arg;
        }
    }

    return options;
}

// Decode base64 string
function decodeBase64(str) {
    return Buffer.from(str, 'base64').toString('utf-8');
}

// Convert RGB to hex color
function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = parseInt(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Check if pattern is a regex (contains special characters)
function isPotentialRegex(pattern) {
    const regexSpecialChars = /[.*+?^${}()|[\]\\]/;
    return regexSpecialChars.test(pattern);
}

// Parse LogViewer verbosity to our severity
function parseSeverity(verbosity) {
    const map = {
        'VERBOSE': 'verbose',
        'DEBUG': 'debug',
        'INFO': 'info',
        'WARN': 'warning',
        'WARNING': 'warning',
        'ERROR': 'error'
    };
    return map[verbosity?.toUpperCase()] || 'info';
}

// Parse a single filter line from LogViewer format
function parseLogViewerFilter(line, index) {
    // Format: name,base64(pattern),flags,R:G:B[,verbosity]
    const parts = line.split(',');

    if (parts.length < 4) {
        console.warn(`  ⚠️ Skipping invalid line ${index + 1}: insufficient parts`);
        return null;
    }

    try {
        const name = parts[0];
        const pattern = decodeBase64(parts[1]);
        const flags = parseInt(parts[2]);
        const colorParts = parts[3].split(':');

        if (colorParts.length !== 3) {
            console.warn(`  ⚠️ Skipping line ${index + 1}: invalid color format`);
            return null;
        }

        const color = rgbToHex(colorParts[0], colorParts[1], colorParts[2]);

        // Verbosity is optional (legacy format doesn't have it)
        const verbosity = parts.length > 4 ? parts[4] : 'VERBOSE';

        // Check if case insensitive (flag 2 = Pattern.CASE_INSENSITIVE)
        const caseSensitive = (flags & 2) === 0;

        // Determine if it's a regex
        const isRegex = isPotentialRegex(pattern);

        return {
            id: `filter-${index + 1}`,
            name: name,
            pattern: pattern,
            isRegex: isRegex,
            caseSensitive: caseSensitive,
            color: color,
            enabled: true,
            severity: parseSeverity(verbosity),
            // Store original data for reference
            _original: {
                flags: flags,
                verbosity: verbosity
            }
        };
    } catch (e) {
        console.warn(`  ⚠️ Skipping line ${index + 1}: ${e.message}`);
        return null;
    }
}

// Read and parse LogViewer filter file
function parseLogViewerFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const filters = [];
    lines.forEach((line, index) => {
        const filter = parseLogViewerFilter(line.trim(), index);
        if (filter) {
            filters.push(filter);
        }
    });

    return filters;
}

// Convert to pack.json format
function convertToPack(filters, options) {
    const inputBasename = path.basename(options.input, path.extname(options.input));

    const packId = options.packId || inputBasename.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const packName = options.packName || inputBasename.replace(/[-_]/g, ' ');

    // Clean up filter objects (remove _original)
    const cleanFilters = filters.map(f => {
        const { _original, severity, ...filter } = f;
        return filter;
    });

    const pack = {
        id: packId,
        name: packName,
        version: '1.0.0',
        author: options.author,
        description: `Converted from LogViewer filter file: ${path.basename(options.input)}`,
        tags: options.tags,
        filters: cleanFilters,
        exceptionRules: [],
        logFormats: [],
        changelog: [
            {
                version: '1.0.0',
                date: new Date().toISOString().split('T')[0],
                changes: [`Converted from LogViewer format (${filters.length} filters)`]
            }
        ]
    };

    // If group option is specified, wrap filters in a group
    if (options.group) {
        pack.filterGroups = [
            {
                id: 'group-1',
                name: options.group,
                filters: pack.filters
            }
        ];
        delete pack.filters;
    }

    return pack;
}

// Generate conversion report
function generateReport(filters, options) {
    console.log('\n📊 Conversion Report:');
    console.log('─'.repeat(50));
    console.log(`  Input file:  ${options.input}`);
    console.log(`  Output file: ${options.output}`);
    console.log(`  Total filters converted: ${filters.length}`);

    // Statistics
    const regexCount = filters.filter(f => f.isRegex).length;
    const caseSensitiveCount = filters.filter(f => f.caseSensitive).length;
    const colors = [...new Set(filters.map(f => f.color))];

    console.log(`\n  Statistics:`);
    console.log(`    Regex patterns:     ${regexCount}`);
    console.log(`    Simple patterns:    ${filters.length - regexCount}`);
    console.log(`    Case sensitive:     ${caseSensitiveCount}`);
    console.log(`    Case insensitive:   ${filters.length - caseSensitiveCount}`);
    console.log(`    Unique colors:      ${colors.length}`);

    console.log('\n  Filters:');
    filters.slice(0, 10).forEach(f => {
        const type = f.isRegex ? 'regex' : 'simple';
        console.log(`    ${f.color} ${f.name} (${type})`);
    });
    if (filters.length > 10) {
        console.log(`    ... and ${filters.length - 10} more`);
    }
}

// Main function
function main() {
    const options = parseArgs();

    if (!options.input) {
        console.log('LogViewer Filter Converter\n');
        console.log('Usage: node convert-logviewer.js <input.filter> [options]\n');
        console.log('Options:');
        console.log('  --output, -o     Output file path');
        console.log('  --pack-id        Pack ID (lowercase, hyphenated)');
        console.log('  --pack-name      Pack display name');
        console.log('  --author         Author name');
        console.log('  --tags           Comma-separated tags');
        console.log('  --group          Group name for filters');
        console.log('\nExample:');
        console.log('  node convert-logviewer.js my-filters.filter --author chgocn --tags android,crash');
        process.exit(1);
    }

    if (!fs.existsSync(options.input)) {
        console.error(`❌ Input file not found: ${options.input}`);
        process.exit(1);
    }

    // Set default output path
    if (!options.output) {
        const inputDir = path.dirname(options.input);
        const inputBasename = path.basename(options.input, path.extname(options.input));
        options.output = path.join(inputDir, `${inputBasename}_converted.json`);
    }

    console.log('🔄 Converting LogViewer filters...\n');

    // Parse and convert
    const filters = parseLogViewerFile(options.input);

    if (filters.length === 0) {
        console.error('❌ No valid filters found in the input file');
        process.exit(1);
    }

    const pack = convertToPack(filters, options);

    // Ensure output directory exists
    const outputDir = path.dirname(options.output);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    fs.writeFileSync(options.output, JSON.stringify(pack, null, 2));

    generateReport(filters, options);

    console.log('\n✅ Conversion complete!');
    console.log(`   Output saved to: ${options.output}`);
}

main();
