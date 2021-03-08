const papa = require('papaparse');
const fs = require('fs');
const { titleCase } = require('title-case');
const { sortBy } = require('lodash');

const csvString = fs.readFileSync('./data/dagri2017-raw.csv').toString();

const output = papa.parse(csvString);

const rows = output.data;

const cleanRows = [];
rows.shift();

const typeMap = new Map();

rows.forEach(row => {
    const [code, levelString, type] = row;
    if (!code) return;

    const level1Code = code.substr(0, 2);
    const level2Code = code.substr(0, 5);

    const level = parseInt(levelString);
    let prefix = '';
    let unprefixedName = '';
    unprefixedName = row[level + 2].replace(/Kep\./ig, 'Kepulauan');
    unprefixedName = unprefixedName.replaceAll('"', '\'');
    if (level === 1) {
        if (unprefixedName.startsWith('DKI')) {
            unprefixedName = 'DKI Jakarta';
        } else {
            unprefixedName = titleCase(unprefixedName.toLowerCase());
        }

        prefix = 'Provinsi';
    }
    else if (level === 2) {
        unprefixedName = titleCase(unprefixedName.toLowerCase());
        if (unprefixedName.startsWith('Kab.')) {
            unprefixedName = 'Kabupaten' + unprefixedName.substr(4);
        }
        if (level1Code === '31') { // DKI Jakarta
            if (code === '31.01') prefix = 'Kabupaten Administrasi';
            else prefix = 'Kota Administrasi';
            unprefixedName = unprefixedName.replaceAll('Adm.', 'Administrasi');
        } else {
            if (type === 'KOTA') prefix = 'Kota';
            else prefix = 'Kabupaten';
        }
        unprefixedName = unprefixedName.substr(prefix.length + 1);
    }
    else if (level === 3) {
        prefix = 'Kecamatan';
        if (level1Code === '91' || level1Code === '92') {
            // Papua & Papua Barat use Distrik instead of Kecamatan
            prefix = 'Distrik';
        } else if (level1Code === '34') {
            // Yogyakarta uses Kapanewon & Kemantren
            prefix = 'Kapanewon';
            if (level2Code === '34.71') {
                prefix = 'Kemantren';
            }
        }
        unprefixedName = unprefixedName.replace(/\.$/, '');
    }
    else if (level === 4) {
        prefix = '';
        if (type === 'KELURAHAN') {
            prefix = 'Kelurahan';
        } else {
            prefix = 'Desa';
            if (level1Code === '11') { // Aceh
                prefix = 'Gampong';
                if (unprefixedName.startsWith('Gampong')) {
                    unprefixedName = unprefixedName.replace(/^Gampong /, '');
                }
                unprefixedName = unprefixedName.replace(/Kp(\.|\.? )/ig, 'Kampong ');
                unprefixedName = unprefixedName.replace(/Tgk(\.|\.? )/ig, 'Teungku ');
                unprefixedName = unprefixedName.replace(/Mns(\.|\.? )/ig, 'Meunasah ');
                unprefixedName = unprefixedName.replace(/^Meuna\./, 'Meunasah');
                unprefixedName = unprefixedName.replace(/^Mesj\./, 'Mesjid');
            } else if (level1Code === '12') { // Sumatera Barat
                unprefixedName = unprefixedName.replace('J.', 'Janji');
            } else if (level1Code === '13') { // Sumatera Barat
                prefix = 'Nagari';
            } else if (level1Code === '16') { // Sumatera Selatan
                unprefixedName = unprefixedName.replace(/Lb\.? /, 'Lubuk ');
            } else if (level1Code === '34') { // Yogyakarta
                prefix = 'Kalurahan';
            } else if (level1Code === '81' || level1Code === '82') { // Yogyakarta
                prefix = 'Negeri';
            } else if (level1Code === '91' || level1Code === '92') { // Yogyakarta
                prefix = 'Kampung';
            } else if (level2Code === '15.08') { // Jambi
                prefix = 'Dusun';
            } else if (level2Code === '18.12') {
                prefix = 'Tiyuh';
            } else if ([
                '64.03', '64.07', '64.11', // Kalimantan Timur
                '18.02', '18.05', '18.12', '18.11', '18.08', // Lampung
            ].includes(level2Code)) { // Kalimantan Timur
                prefix = 'Kampung'
            } else if ([
                '18.06', '18.10', '18.04', '18.13' // Lampung
            ].includes(level2Code)) { // Kalimantan Timur
                prefix = 'Pekon'
            }

            // Fix abbreviations/mal-abbreviations
            unprefixedName = unprefixedName.replace('Sei.', 'Sei');
            unprefixedName = unprefixedName.replace(/^Perk\./, 'Perkebunan');
            unprefixedName = unprefixedName.replace(/Tj\.? /, 'Tanjung ');
        }

        unprefixedName = unprefixedName.replace(/ D\.? /, ' D-');
    }

    unprefixedName = unprefixedName.replace(/^Gn\.? /, 'Gunung ');
    unprefixedName = unprefixedName.replace(/\s+/g, ' ');
    unprefixedName = titleCase(unprefixedName);
    unprefixedName = unprefixedName.replace(/ *\/ */g, '/');

    cleanRows.push({
        code,
        level,
        type,
        localPrefix: prefix,
        name: unprefixedName
    });
});

const sortedCleanRows = sortBy(cleanRows, row => row.code);

const outputCsv = papa.unparse(sortedCleanRows);
fs.writeFileSync('./data/dagri2017.csv', outputCsv);

sortedCleanRows.forEach(row => {
    delete row.type;
})

const outputCsvInternal = papa.unparse(sortedCleanRows, { delimiter: '\t' })
fs.writeFileSync('./data/dagri2017.tsv', outputCsvInternal);

