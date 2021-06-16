import csv
import re
import requests


def parse_line(line):
    global previous_code

    code: str
    name: str
    code, name = line

    output_keys = [code[0:2]]
    if len(code) <= 5:
        output_keys.append('root')

    # sanitise name & make code shorter
    if len(code) == 2:
        # for provinsi, covert all-caps to title-case
        name = name.title()
        if code == '31':
            name = name.replace('Dki', 'DKI')

        previous_code = code

    elif len(code) == 5:
        # for kabupaten/kota, remove the prefix
        # prefix can be determined based on the code (if >70 then kota)
        name = re.sub('^(KAB\.|KOTA) (ADM\. )?', '', name)

        # then convert all-caps to title-case
        name = name.title()

        # make code shorter
        code = '.' + code[3:5]

    elif len(code) == 8:
        code = ':' + code[6:8]

    elif len(code) == 13:
        code = code[9:13]

    return code, name, output_keys


source_url = 'https://github.com/kodewilayah/permendagri-72-2019/raw/main/dist/base.csv'
output_path = './public/data/dagri2019/'

prov_codes = ['root',
              '11', '12', '13', '16', '14', '15', '17', '18', '19', '21',
              '31', '32', '33', '34', '35', '36',
              '51', '52', '53',  '61', '62', '63', '64', '65',
              '71', '72', '73', '74', '75', '76',
              '81', '82', '91', '92']

output = dict()

for code in prov_codes:
    output[code] = open(output_path + code + '.tsv', 'w')

response = requests.get(source_url, stream=True)
reader = csv.reader(response.iter_lines(decode_unicode=True))

for line in reader:
    code, name, output_keys = parse_line(line)
    output_line = f'{code}\t{name}\n'
    for key in output_keys:
        output[key].write(output_line)

# close handles
response.close()

for handle in output.values():
    handle.close()