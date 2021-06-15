import csv
import re
import requests

source_url = 'https://github.com/kodewilayah/permendagri-72-2019/raw/main/dist/base.csv'
output_path = './public/data/dagri2019-sparse.tsv'

previous_code = ''


def parse_line(line):
    global previous_code

    code: str
    name: str
    code, name = line

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

    return code, name


with requests.Session() as session, open(output_path, 'w') as output:
    response = session.get(source_url, stream=True)
    reader = csv.reader(response.iter_lines(decode_unicode=True))
    for line in reader:
        code, name = parse_line(line)
        output.write(f'{code}\t{name}\n')